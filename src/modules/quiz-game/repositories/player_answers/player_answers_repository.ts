import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerAnswer } from '../../domain/entities/quiz_player_answers.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerAnswersRepository {
  constructor(
    @InjectRepository(PlayerAnswer)
    private playerAnswerRepository: Repository<PlayerAnswer>,
  ) {}

  async save(playerAnswer: PlayerAnswer): Promise<string> {
    try {
      const createdPlayerAnswer =
        await this.playerAnswerRepository.save(playerAnswer);
      return createdPlayerAnswer.id.toString();
    } catch (e) {
      return 'DSKADKDSKADKDSAKDASKDAS';
    }
  }

  async findAnswersByPlayerIdAndGameId(
    playerId: number,
    gameId: number,
  ): Promise<PlayerAnswer[]> {
    return this.playerAnswerRepository.find({
      where: {
        player: {
          id: playerId,
          game: {
            id: gameId,
          },
        },
      },
      relations: {
        player: {
          game: true,
        },
      },
    });
  }
}
