import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameStatus, Player } from '../../domain/entities/quiz_players.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class PlayersQueryRepository {
  constructor(
    @InjectRepository(Player) private playerQueryRepository: Repository<Player>,
  ) {}

  async findPlayerByUserId(userId: number): Promise<Player | null> {
    return this.playerQueryRepository.findOne({
      where: { userId: userId },
    });
  }

  async findPlayerByUserIdAndGameId(userId: number): Promise<Player | null> {
    return this.playerQueryRepository.findOne({
      where: {
        userId: userId,
        playerStatus: Not(GameStatus.Finished),
      },
    });
  }

  async findPlayerById(playerId: number): Promise<Player | null> {
    return this.playerQueryRepository.findOne({
      where: { id: playerId },
    });
  }
}
