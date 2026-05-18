/*
Вот это правильный вопрос — ты как раз упёрся в точку, где либо делаешь гибкую архитектуру, либо потом всё переписываешь 🙂

Коротко: текущая схема уже почти подходит под N игроков и N вопросов, но нужно чуть «докрутить», чтобы она стала масштабируемой.

🔥 1. Игроки: уже готово к масштабированию

Ты уже на правильном пути с таблицей Player.

👉 Если убрал playerOneId / playerTwoId из Game, то:

одна игра = N записей в Player

gameId → Player[]

✔ Хочешь 2 игрока → проверяешь count = 2
✔ Хочешь 10 игроков → просто меняешь лимит

👉 Добавь ограничение в Game
@Column({ type: 'int', default: 2 })
maxPlayers: number;

И логика:

const playersCount = await playerRepo.count({ where: { gameId } });

if (playersCount >= game.maxPlayers) {
  throw new Error('Game is full');
}
🎯 2. Вопросы: НЕ массив, а нормальная связь

Вот тут у тебя сейчас узкое место.

questions: string[] ❌

Это убьёт тебя при:

увеличении количества вопросов
аналитике
проверке ответов
✅ Правильная модель
GameQuestion (связь игра ↔ вопрос)
@Entity()
export class GameQuestion {
  @Column()
  gameId: number;

  @Column()
  questionId: number;

  @Column()
  order: number; // порядок вопроса

  @Column({ default: true })
  isActive: boolean;
}
Почему это лучше:

✔ можно хоть 5, хоть 100 вопросов
✔ можно менять порядок
✔ можно добавлять вопросы во время игры
✔ можно делать пагинацию

🧠 3. Ответы игроков (критично для мультиплеера)

С 2 игроками ещё можно «схитрить», с 3+ — уже нет.

PlayerAnswer
@Entity()
export class PlayerAnswer {
  @Column()
  playerId: number;

  @Column()
  questionId: number;

  @Column()
  answer: string;

  @Column()
  isCorrect: boolean;

  @Column()
  answeredAt: Date;
}
⚡ 4. Логика "кто быстрее" для N игроков

Вот тут начинается самое интересное.

Ты писал:

+1 очко тому, кто ответит быстрее

С 2 игроками просто.
С N игроками — нужно определить первого правильного.

✔ Правильный алгоритм:

Для каждого вопроса:

1. Берём все ответы игроков
2. Фильтруем только правильные
3. Сортируем по answeredAt
4. Первый получает бонус
Пример:
Игрок	Ответ	Время
A	❌	1.2s
B	✅	2.0s
C	✅	1.5s

👉 Побеждает C (первый правильный)

🏆 5. Подсчёт очков (расширяемый вариант)
// за правильный ответ
if (isCorrect) {
  score += 1;
}

// бонус за скорость
if (isFirstCorrect) {
  score += 1;
}
🎮 6. Когда начинать игру

Раньше:

было "нашёлся второй игрок → старт"

Теперь:

👉 варианты:

playersCount === maxPlayers
таймер (например 10 сек ожидания)
ручной старт
🧱 7. Статусы игроков (важно при N игроках)
playerStatus:
- waiting
- ready
- playing
- finished
- left
💡 8. Что ты получаешь после этих изменений

✔ масштабируемость (2 → 100 игроков)
✔ гибкость по вопросам
✔ честный подсчёт очков
✔ нормальную аналитику

🚀 Итог

Тебе нужно сделать всего 3 ключевых изменения:

❌ убрать массивы вопросов
✅ сделать GameQuestion
✅ добавить PlayerAnswer

И тогда:

👉 количество игроков = любое
👉 количество вопросов = любое
👉 логика остаётся чистой
 */

/*
Окей, это уже полноценная бизнес-логика сервиса, а не просто сущности. Я разложу тебе это как архитектуру + алгоритмы + псевдокод, чтобы ты мог прямо реализовать.

🧠 0. Основные статусы игры
enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}
🧩 1. JOIN (создание / поиск пары)
🎯 Логика
async joinGame(userId: number) {
  // 1. Проверка — нет ли уже активной игры
  const existing = await findActiveGameByUser(userId);
  if (existing) throw new Error('Already in game');

  // 2. Ищем игрока в ожидании
  const pendingGame = await gameRepo.findOne({
    where: { gameStatus: PendingSecondPlayer },
    relations: ['players'],
  });

  if (pendingGame) {
    // 3. Присоединяемся вторым игроком
    const player = createPlayer(userId, pendingGame.id);

    pendingGame.players.push(player);
    pendingGame.gameStatus = Active;
    pendingGame.startGame = new Date();

    // 🔥 создаём вопросы
    const questions = await getRandomQuestions(5);
    const questionEntities =
      QuestionForGame.createQuestionPack(pendingGame.id, questions);

    await saveAll([player, pendingGame, ...questionEntities]);

    return pendingGame;
  }

  // 4. Иначе создаём новую игру
  const game = new Game();
  game.gameStatus = PendingSecondPlayer;

  const player = createPlayer(userId, game.id);

  await saveAll([game, player]);

  return game;
}
🎯 2. Получение текущей игры
GET /pairs/my-current
async getMyCurrentGame(userId: number) {
  return gameRepo.findOne({
    where: {
      players: { userId },
      gameStatus: In([PendingSecondPlayer, Active]),
    },
    relations: ['players', 'questions'],
  });
}
❗ ВАЖНО (по ТЗ)

Если:

status === PendingSecondPlayer

👉 возвращаешь:

questions: null
secondPlayerProgress: null
startGameDate: null
finishGameDate: null
🎯 3. Ответ на вопрос
🔥 Главная логика
async answerQuestion(userId: number, answer: string) {
  const player = await getPlayer(userId);
  const game = await getGame(player.gameId);

  if (game.gameStatus !== 'Active') throw Error();

  // 1. Получаем текущий вопрос
  const currentQuestion = await getNextQuestion(player.id);

  if (!currentQuestion) throw Error('No questions left');

  // 2. Проверяем ответ
  const isCorrect = checkAnswer(currentQuestion.questionId, answer);

  // 3. Сохраняем ответ
  const playerAnswer = new PlayerAnswer();
  playerAnswer.playerId = player.id;
  playerAnswer.questionId = currentQuestion.id;
  playerAnswer.answer = answer;
  playerAnswer.isCorrect = isCorrect;
  playerAnswer.answeredAt = new Date();

  // 4. Обновляем счёт
  if (isCorrect) player.score += 1;

  await saveAll([playerAnswer, player]);

  // 5. Проверяем завершение
  await tryFinishGame(game.id);

  return playerAnswer;
}
🧠 4. Как определить "следующий вопрос"
async getNextQuestion(playerId: number) {
  const answered = await answerRepo.find({
    where: { playerId },
  });

  const answeredIds = answered.map(a => a.questionId);

  return questionForGameRepo.findOne({
    where: {
      id: Not(In(answeredIds)),
    },
    order: { orderIndex: 'ASC' },
  });
}
🏁 5. Завершение игры
🔥 Ключевая логика
async tryFinishGame(gameId: number) {
  const game = await getGameWithPlayers(gameId);

  const players = game.players;

  const allAnswered = await Promise.all(
    players.map(async (p) => {
      const count = await countAnswers(p.id);
      return count === 5;
    })
  );

  if (!allAnswered.every(Boolean)) return;

  // 🔥 оба игрока закончили → считаем бонус
  applySpeedBonus(players);

  game.gameStatus = 'Finished';
  game.endGame = new Date();

  await saveAll([game, ...players]);
}
⚡ 6. Бонус за скорость
function applySpeedBonus(players: Player[]) {
  const [p1, p2] = players;

  const lastAnswer1 = getLastAnswerTime(p1.id);
  const lastAnswer2 = getLastAnswerTime(p2.id);

  const hasCorrect1 = p1.score > 0;
  const hasCorrect2 = p2.score > 0;

  if (lastAnswer1 < lastAnswer2 && hasCorrect1) {
    p1.score += 1;
  }

  if (lastAnswer2 < lastAnswer1 && hasCorrect2) {
    p2.score += 1;
  }
}
🧠 7. Победитель

Можно вычислять на лету:

function getWinner(players: Player[]) {
  if (players[0].score > players[1].score) return players[0];
  if (players[1].score > players[0].score) return players[1];
  return null; // ничья
}
⚠️ Важные edge cases
❗ 1. Двойной ответ

👉 запретить:

UNIQUE(playerId, questionId)
❗ 2. Ответ после завершения
if (game.status === Finished) throw Error
❗ 3. Игрок отвечает быстрее, чем второй начал

👉 нормально — второй просто догоняет

🧠 Итог архитектуры

Ты реализуешь:

✔ Matchmaking
Pending → Active
✔ Game session
фиксированные вопросы
порядок через orderIndex
✔ Answer flow
1 вопрос → 1 ответ
✔ Scoring
базовые очки
бонус за скорость
 */
