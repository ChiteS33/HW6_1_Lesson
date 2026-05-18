import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PlayersRepository } from '../../../repositories/playersRepository/players.repository';
import { GameRepository } from '../../../repositories/gameRepository/game.repository';
import { QuizQuestionsRepository } from '../../../repositories/quizQuestionsRepository/questions.repository';
import {
  GameStatus,
  Player,
  PlayerStatus,
} from '../../../domain/entities/quiz_players.entity';
import { QuestionForGame } from '../../../domain/entities/quiz_game_questions.entity';
import { Game } from '../../../domain/entities/quiz_games.entity';
import { QuestionForGameRepository } from '../../../repositories/question_for_game/question_for_game.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { log } from 'node:util';

export class ConnectUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectUserCommand)
export class ConnectUserUseCase implements ICommandHandler<ConnectUserCommand> {
  constructor(
    @Inject(PlayersRepository) private playerRepository: PlayersRepository,
    @Inject(GameRepository) private gameRepository: GameRepository,
    @Inject(QuizQuestionsRepository)
    private quizQuestionsRepository: QuizQuestionsRepository,
    @Inject(QuestionForGameRepository)
    private questionForGameRepository: QuestionForGameRepository,
  ) {}

  async execute(command: ConnectUserCommand): Promise<any> {
    const userId = Number(command.userId);

    const foundPlayer = await this.playerRepository.findPlayerByUserId(userId);
    if (foundPlayer) {
      if (foundPlayer?.playerStatus !== GameStatus.Finished.toString())
        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          field: 'userId',
          message: 'Ты активен ДЕБИЛ!',
        });
    }

    // Находим игру
    const waitingGame = await this.gameRepository.findWaitingGame();
    // Если нет, то создаём
    if (!waitingGame) {
      const newGame = Game.createGame();
      const savedGameId = await this.gameRepository.save(newGame);
      const newPlayer = Player.registerPlayer(userId, Number(savedGameId));
      await this.playerRepository.save(newPlayer);
      const createdGame = await this.gameRepository.findGameById(
        Number(savedGameId),
      );

      return viewGameQuizMapper(createdGame!);
    }
    // Если есть, то апдейтим ее
    else {
      waitingGame.updateGame();
      const updatedGameId = await this.gameRepository.save(waitingGame);
      const firstPlayer = waitingGame.players[0];
      // меняем статус первому игроку

      firstPlayer.updatePlayerStatus(PlayerStatus.playing.toString());
      await this.playerRepository.save(firstPlayer);

      // создаём 2 игрока
      const newPlayer = Player.registerPlayer(userId, Number(waitingGame.id));
      newPlayer.playerStatus = PlayerStatus.playing.toString();
      await this.playerRepository.save(newPlayer);
      // берём рандомные 5 вопросов
      const questions =
        await this.quizQuestionsRepository.takeRandomQuestions();
      // Создаём пак вопросов, для игры
      const questionEntities = QuestionForGame.createQuestionPack(
        Number(waitingGame.id),
        questions.map((q) => q.id),
      );
      await this.questionForGameRepository.save(questionEntities);
      // ещё раз находим созданную игру и мапим
      const foundGame = await this.gameRepository.findGameById(
        Number(updatedGameId),
      );

      return viewGameQuizMapper(foundGame!);
    }
  }
}

export const viewGameQuizMapper = (game: Game) => {
  return {
    id: game.id.toString(),
    firstPlayerProgress: {
      answers: [...(game.players[0]?.playerAnswers ?? [])]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        ?.map((el) => ({
          questionId: el.questionId.toString(),
          answerStatus: el.isCorrect ? 'Correct' : 'Incorrect',
          addedAt: el.createdAt.toISOString(),
        })),
      player: {
        id: game.players[0]?.user?.id?.toString() ?? null,
        login: game.players[0]?.user?.login ?? null,
      },
      score: game.players[0]?.score ?? 0,
    },
    secondPlayerProgress: game.players[1]
      ? {
          answers: [...(game.players[1]?.playerAnswers ?? [])]
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((el) => ({
              questionId: el.questionId.toString(),
              answerStatus: el.isCorrect ? 'Correct' : 'Incorrect',
              addedAt: el.createdAt.toISOString(),
            })),
          player: {
            id: game.players[1]?.user?.id?.toString() ?? null,
            login: game.players[1]?.user?.login ?? null,
          },
          score: game.players[1]?.score ?? 0,
        }
      : null,
    questions: game.questions.length
      ? [...game.questions]
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((q) => ({
            id: q.question?.id?.toString() ?? null,
            body: q.question?.body ?? null,
          }))
      : null,
    status: game.gameStatus,
    pairCreatedDate: game.pairCreatedDate?.toISOString() ?? null,
    startGameDate: game.startGame?.toISOString() ?? null,
    finishGameDate: game.endGame?.toISOString() ?? null,
  };
};

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaWF0IjoxNzc4OTM2ODM4LCJleHAiOjE3Nzg5NDQwMzh9.hR-XTk6seW3UVZbbgOAl1OZc_cfpk7DoKyyT1otLt2g user1
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiaWF0IjoxNzc4OTM2ODc4LCJleHAiOjE3Nzg5NDQwNzh9.EbOZGIb6cv5_8RlsgVPUDl2RNxMYsBfyNkjPpE26gpw user2
