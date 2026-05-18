import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Game } from '../../domain/entities/quiz_games.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionForGame } from '../../domain/entities/quiz_game_questions.entity';
import { GameStatus } from '../../domain/entities/quiz_players.entity';

@Injectable()
export class QuizGameQueryRepository {
  constructor(
    @InjectRepository(Game) private gameQueryRepository: Repository<Game>,
    @InjectRepository(QuestionForGame)
    private questionForGameRepository: Repository<QuestionForGame>,
  ) {}

  async findGameById(gameId: number): Promise<Game | null> {
    const game = await this.gameQueryRepository.findOne({
      where: { id: gameId },
      relations: {
        players: {
          user: true,
          playerAnswers: true,
        },
        questions: {
          question: true,
        },
      },
      order: {
        players: {
          createdAt: 'ASC',
        },
        questions: {
          id: 'ASC',
        },
      },
    });

    return game;
  }
  async findCurrentGame(gameId: number): Promise<Game | null> {
    const game = await this.gameQueryRepository.findOne({
      where: {
        id: gameId,
        gameStatus: In([GameStatus.Active, GameStatus.PendingSecondPlayer]),
      },
      relations: {
        players: {
          user: true,
          playerAnswers: true,
        },
        questions: {
          question: true,
        },
      },
      order: {
        players: {
          createdAt: 'ASC',
        },
        questions: {
          id: 'ASC',
        },
      },
    });

    return game;
  }
}
