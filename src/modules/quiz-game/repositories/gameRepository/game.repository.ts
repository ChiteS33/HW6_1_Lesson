import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Game } from '../../domain/entities/quiz_games.entity';
import { GameStatus } from '../../domain/entities/quiz_players.entity';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
  ) {}

  async save(game: Game): Promise<string> {
    const createdGame = await this.gameRepository.save(game);
    return createdGame.id.toString();
  }

  async finishedGame(
    gameId: number,
    status: GameStatus,
    endDate: Date,
  ): Promise<void> {
    await this.gameRepository.update(gameId, {
      gameStatus: status,
      endGame: endDate,
    });
  }

  async findGameByUserId(userId: number): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: {
        players: {
          user: { id: userId },
        },
      },
      relations: {
        players: {
          user: true,
        },
        questions: {
          question: true,
          playerAnswers: true,
        },
      },
    });
  }

  // async findGameById(gameId: number): Promise<Game | null> {
  //   return this.gameRepository.findOne({
  //     where: { id: gameId },
  //     relations: {
  //       players: {
  //         user: true,
  //       },
  //       questions: {
  //         question: true,
  //         playerAnswers: true,
  //       },
  //     },
  //   });
  // }

  async findGameById(gameId: number): Promise<Game | null> {
    return this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.players', 'players')
      .leftJoinAndSelect('players.user', 'user')
      .leftJoinAndSelect('players.playerAnswers', 'playerAnswers')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .addOrderBy('players.id', 'ASC') // 👈 сортируем игроков по id
      .addOrderBy('questions.id', 'ASC') // 👈 сортируем вопросы по id
      .addOrderBy('playerAnswers.createdAt', 'ASC') // 👈 ответы по времени
      .where('game.id = :gameId', { gameId })
      .getOne();
  }

  async findWaitingGame(): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: { gameStatus: GameStatus.PendingSecondPlayer },
      relations: {
        players: {
          user: true,
        },
        questions: {
          question: {
            questions: true,
          },
          playerAnswers: true,
        },
      },
    });
  }

  async findAllPlayersInGame(gameId: number): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: { id: gameId },
      relations: {
        players: {
          user: true,
        },
      },
    });
  }

  // async findActiveGameByPlayerId(userId: number): Promise<Game | null> {
  //   return this.gameRepository.findOne({
  //     where: {
  //       gameStatus: Not(GameStatus.Finished),
  //       players: {
  //         user: {
  //           id: userId,
  //         },
  //       },
  //     },
  //     relations: {
  //       players: {
  //         user: true,
  //       },
  //       questions: {
  //         question: true,
  //       },
  //     },
  //   });
  // }
  async findActiveGameByPlayerId(userId: number): Promise<Game | null> {
    return this.gameRepository
      .createQueryBuilder('game')
      .innerJoin('game.players', 'player')
      .innerJoin('player.user', 'user')
      .leftJoinAndSelect('game.players', 'players')
      .leftJoinAndSelect('players.user', 'puser')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .where('user.id = :userId', { userId })
      .andWhere('game.gameStatus != :finished', {
        finished: GameStatus.Finished,
      })
      .getOne();
  }
}
