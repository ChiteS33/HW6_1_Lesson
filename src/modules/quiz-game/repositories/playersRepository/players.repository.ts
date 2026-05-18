import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameStatus, Player } from '../../domain/entities/quiz_players.entity';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async save(player: Player): Promise<string> {
    const createdPlayer = await this.playerRepository.save(player);
    return createdPlayer.id.toString();
  }

  async findPlayerById(playerId: number): Promise<Player | null> {
    return this.playerRepository.findOne({
      where: { id: playerId },
      relations: {
        user: true,
      },
    });
  }

  async findPlayerByUserIdAndGameId(
    userId: number,
    gameId: number,
  ): Promise<Player | null> {
    return this.playerRepository.findOne({
      where: { userId: userId, gameId: gameId },
    });
  }

  async findActivePlayerByUserId(userId: number): Promise<Player | null> {
    return this.playerRepository
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.game', 'game')
      .where('player.userId = :userId', { userId })
      .andWhere('game.gameStatus != :finishedStatus', {
        finishedStatus: GameStatus.Finished,
      })
      .getOne();
  }

  async findPlayerByUserId(userId: number): Promise<Player | null> {
    return this.playerRepository.findOne({
      where: { userId: userId },
      relations: {
        game: true,
      },
    });
  }
}
