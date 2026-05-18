import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../../repositories/gameRepository/game.repository';
import { Inject } from '@nestjs/common';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import {
  GameStatus,
  Player,
  PlayerStatus,
} from '../../../domain/entities/quiz_players.entity';
import { PlayersRepository } from '../../../repositories/playersRepository/players.repository';
import { QuestionForGameRepository } from '../../../repositories/question_for_game/question_for_game.repository';
import { PlayerAnswersRepository } from '../../../repositories/player_answers/player_answers_repository';
import { QuestionForGame } from '../../../domain/entities/quiz_game_questions.entity';
import { PlayerAnswer } from '../../../domain/entities/quiz_player_answers.entity';

export class GetCurrentAnswerCommand {
  constructor(
    public userId: string,
    public body: { answer: string },
  ) {}
}

// @CommandHandler(GetCurrentAnswerCommand)
// export class GetCurrentAnswerUseCase implements ICommandHandler<GetCurrentAnswerCommand> {
//   constructor(
//     @Inject(GameRepository) private gameRepository: GameRepository,
//     @Inject(PlayersRepository) private playersRepository: PlayersRepository,
//     @Inject(QuestionForGameRepository)
//     private questionForGameRepository: QuestionForGameRepository,
//     @Inject(PlayerAnswersRepository)
//     private playerAnswerRepository: PlayerAnswersRepository,
//   ) {}
//
//   async execute(command: GetCurrentAnswerCommand): Promise<any> {
//     // 1. Нашли активные игры
//     const game = await this.gameRepository.findActiveGameByPlayerId(
//       Number(command.userId),
//     );
//     if (!game)
//       throw new DomainException({
//         code: DomainExceptionCode.Forbidden,
//         field: 'userId',
//         message: 'User is not inside an active pair',
//       });
//
//     if (game.gameStatus !== GameStatus.Active)
//       throw new DomainException({
//         code: DomainExceptionCode.Forbidden,
//         field: 'gameId',
//         message: 'Game status not active',
//       });
//
//     //2. Нашли игрока
//     const player = await this.playersRepository.findPlayerByUserIdAndGameId(
//       Number(command.userId),
//       game.id,
//     );
//
//     if (!player)
//       throw new DomainException({
//         code: DomainExceptionCode.Forbidden,
//         field: 'userId',
//         message: 'User not found',
//       });
//
//     if (player.playerStatus === PlayerStatus.finished.toString()) {
//       throw new DomainException({
//         code: DomainExceptionCode.Forbidden,
//         field: 'playerStatus',
//         message: 'You have already finished the game',
//       });
//     }
//     //3. Нашли все вопросы для игры
//     const gameQuestions: QuestionForGame[] =
//       await this.questionForGameRepository.findQuestionsByGameId(game.id);
//     gameQuestions.sort((a, b) => a.orderIndex - b.orderIndex);
//     // console.log(gameQuestions);
//     //4. Нашли все ответы игрока на вопросы в этой игре
//     const playerAnswers =
//       await this.playerAnswerRepository.findAnswersByPlayerId(player.id);
//     // console.log(playerAnswers.length);
//     //5. Нашли индекс с которого надо начинать брать вопросы
//     const nextQuestionIndex = playerAnswers.length;
//
//     if (nextQuestionIndex >= gameQuestions.length) {
//       throw new DomainException({
//         code: DomainExceptionCode.Forbidden,
//         field: 'questions',
//         message: 'You have already finished the game',
//       });
//     }
//
//     //7. Нашли следующий ответ, на который надо отвечать
//     const nextQuestion: QuestionForGame = gameQuestions[nextQuestionIndex];
//     // console.log(nextQuestion.question.id);
//     //8 Проверка ответа на вопрос
//     const isCorrect = nextQuestion.question.answers.some((el) => {
//       return el === command.body.answer;
//     });
//     // console.log(nextQuestion.id);
//     //9 записываем результат
//
//     const newAnswer = PlayerAnswer.createNewAnswer({
//       playerId: player.id,
//       questionId: nextQuestion.question.id,
//       answer: command.body.answer,
//       isCorrect: isCorrect,
//     });
//     // console.log('dasdsadasdsaadsdassad');
//     await this.playerAnswerRepository.save(newAnswer);
//
//     // 10. Ведём счёт игрока счёт игрока
//     const newScore = player.score + (isCorrect ? 1 : 0);
//     player.updateScore(newScore);
//     await this.playersRepository.save(player);
//
//     //11. Проверка был ли эт последний вопрос
//     const isLastQuestion = nextQuestionIndex + 1 === gameQuestions.length;
//     if (isLastQuestion) {
//       const allPlayers = await this.gameRepository.findAllPlayersInGame(
//         game.id,
//       );
//       const kekw = allPlayers?.players.some(
//         (el) => el.playerStatus === GameStatus.Finished.toString(),
//       );
//       if (kekw) {
//         player.updatePlayerStatus(PlayerStatus.finished);
//         player.setFinishDate(new Date());
//         await this.playersRepository.save(player);
//       }
//       // 12. Проверка закончили ли все игроки
//       const allFinished = allPlayers?.players.every(
//         (p) => p.playerStatus === PlayerStatus.finished.toString(),
//       );
//       if (allFinished) {
//         const players = allPlayers!.players;
//
//         //13.сортируем кто быстрее
//         const sortedByTime = [...players].sort(
//           (a, b) => a.finishDate!.getTime() - b.finishDate!.getTime(),
//         );
//         const fastestPlayer = sortedByTime[0];
//
//         //14. проверяем есть ли у него хотя бы 1 правильный ответ
//         const fastestAnswers =
//           await this.playerAnswerRepository.findAnswersByPlayerId(
//             fastestPlayer.id,
//           );
//
//         const hasCorrectAnswer = fastestAnswers.some((a) => a.isCorrect);
//
//         //15. начисляем бонус
//         if (hasCorrectAnswer) {
//           fastestPlayer.updateScore(fastestPlayer.score + 1);
//           await this.playersRepository.save(fastestPlayer);
//         }
//
//         await this.gameRepository.finishedGame(
//           game.id,
//           GameStatus.Finished,
//           new Date(),
//         );
//         return {
//           questionId: nextQuestion.question.id.toString(),
//           answerStatus: isCorrect ? 'Correct' : 'Incorrect',
//           addedAt: newAnswer.createdAt.toISOString(),
//         };
//       }
//     } // <---------
//
//     return {
//       questionId: nextQuestion.question.id.toString(),
//       answerStatus: isCorrect ? 'Correct' : 'Incorrect',
//       addedAt: newAnswer.createdAt.toISOString(),
//     };
//   }
// }

@CommandHandler(GetCurrentAnswerCommand)
export class GetCurrentAnswerUseCase implements ICommandHandler<GetCurrentAnswerCommand> {
  constructor(
    @Inject(GameRepository) private gameRepository: GameRepository,
    @Inject(PlayersRepository) private playersRepository: PlayersRepository,
    @Inject(QuestionForGameRepository)
    private questionForGameRepository: QuestionForGameRepository,
    @Inject(PlayerAnswersRepository)
    private playerAnswerRepository: PlayerAnswersRepository,
  ) {}

  async execute(command: GetCurrentAnswerCommand): Promise<any> {
    // 1. Нашли активные игры
    const game = await this.gameRepository.findActiveGameByPlayerId(
      Number(command.userId),
    );
    if (!game)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'userId',
        message: 'User is not inside an active pair',
      });

    if (game.gameStatus !== GameStatus.Active)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'gameId',
        message: 'Game status not active',
      });

    // 2. Нашли игрока
    const player = await this.playersRepository.findPlayerByUserIdAndGameId(
      Number(command.userId),
      game.id,
    );

    if (!player)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'userId',
        message: 'User not found',
      });

    // Проверка, не закончил ли игрок уже игру
    if (player.playerStatus === PlayerStatus.finished.toString()) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'playerStatus',
        message: 'You have already finished the game',
      });
    }

    // 3. Нашли все вопросы для игры
    const gameQuestions: QuestionForGame[] =
      await this.questionForGameRepository.findQuestionsByGameId(game.id);
    gameQuestions.sort((a, b) => a.orderIndex - b.orderIndex);

    // 4. Нашли все ответы игрока
    const playerAnswers =
      await this.playerAnswerRepository.findAnswersByPlayerIdAndGameId(
        player.id,
        game.id,
      );

    // 5. Проверка, ответил ли уже на все вопросы
    const nextQuestionIndex = playerAnswers.length;

    if (nextQuestionIndex >= gameQuestions.length) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'questions',
        message: 'You have already finished the game',
      });
    }

    // 6. Нашли следующий вопрос
    const nextQuestion: QuestionForGame = gameQuestions[nextQuestionIndex];

    // 7. Проверка ответа
    const isCorrect = nextQuestion.question.answers.some((el) => {
      return el === command.body.answer;
    });

    // 8. Записываем результат
    const newAnswer = PlayerAnswer.createNewAnswer({
      playerId: player.id,
      questionId: nextQuestion.question.id,
      answer: command.body.answer,
      isCorrect: isCorrect,
    });
    await this.playerAnswerRepository.save(newAnswer);

    // 9. Обновляем счёт игрока
    const newScore = player.score + (isCorrect ? 1 : 0);
    player.updateScore(newScore);
    await this.playersRepository.save(player);

    // 10. Проверяем, был ли это последний вопрос для ЭТОГО игрока
    const isLastQuestionForThisPlayer =
      nextQuestionIndex + 1 === gameQuestions.length;

    if (isLastQuestionForThisPlayer) {
      // Запоминаем время последнего ответа
      player.setFinishDate(new Date());
      await this.playersRepository.save(player);

      // Получаем всех игроков в игре с их ответами
      const allPlayers = await this.gameRepository.findAllPlayersInGame(
        game.id,
      );

      // Проверяем, сколько ответов у КАЖДОГО игрока
      let allPlayersFinished = true;
      for (const p of allPlayers!.players) {
        const answersCount =
          await this.playerAnswerRepository.findAnswersByPlayerIdAndGameId(
            p.id,
            game.id,
          );
        if (answersCount.length < gameQuestions.length) {
          allPlayersFinished = false;
          break;
        }
      }

      // Если все игроки ответили на все вопросы - завершаем игру
      if (allPlayersFinished) {
        const players: Player[] = allPlayers!.players;

        // Фильтруем игроков у которых есть finishDate и сортируем
        const playersWithFinishDate = players.filter(
          (p) => p.finishDate !== null,
        );

        if (playersWithFinishDate.length > 0) {
          const sortedByTime = [...playersWithFinishDate].sort(
            (a, b) => a.finishDate!.getTime() - b.finishDate!.getTime(),
          );
          const fastestPlayer = sortedByTime[0];

          // Проверяем, есть ли у самого быстрого хотя бы 1 правильный ответ
          const fastestAnswers =
            await this.playerAnswerRepository.findAnswersByPlayerIdAndGameId(
              fastestPlayer.id,
              game.id,
            );
          const hasCorrectAnswer = fastestAnswers.some((a) => a.isCorrect);

          // Начисляем бонус
          if (hasCorrectAnswer) {
            fastestPlayer.updateScore(fastestPlayer.score + 1);
            await this.playersRepository.save(fastestPlayer);
          }
        }

        // Завершаем игру
        await this.gameRepository.finishedGame(
          game.id,
          GameStatus.Finished,
          new Date(),
        );

        // Меняем статус ВСЕХ игроков на finished
        for (const p of players) {
          if (p.playerStatus !== PlayerStatus.finished.toString()) {
            p.updatePlayerStatus(PlayerStatus.finished);
            await this.playersRepository.save(p);
          }
        }
      }
    }

    return {
      questionId: nextQuestion.question.id.toString(),
      answerStatus: isCorrect ? 'Correct' : 'Incorrect',
      addedAt: newAnswer.createdAt.toISOString(),
    };
  }
}

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaWF0IjoxNzc4OTQwNDE5LCJleHAiOjE3Nzg5NDc2MTl9.N3ZZ1tGVig-0aNHDD7TmuorlYWGEp2gyMqoyIPOpRc4 user1
