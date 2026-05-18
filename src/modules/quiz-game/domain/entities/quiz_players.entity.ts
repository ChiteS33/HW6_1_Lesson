import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';
import { User } from '../../../user-accounts/domain/entities/users.entity';
import { Game } from './quiz_games.entity';
import { PlayerAnswer } from './quiz_player_answers.entity';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

export enum PlayerStatus {
  waiting = 'Waiting...',
  playing = 'Playing...',
  finished = 'Finished',
}

@Entity({ name: 'QuizPlayers' })
export class Player extends BaseDbEntity {
  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  gameId: number | null;

  @Column({ type: 'enum', enum: PlayerStatus })
  playerStatus: string;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @Column({ type: 'timestamp with time zone', default: null, nullable: true })
  finishDate: Date | null;

  @ManyToOne(() => Game, (game) => game.players)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @ManyToOne(() => User, (user) => user.players)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => PlayerAnswer, (playerAnswer) => playerAnswer.player)
  playerAnswers: PlayerAnswer[];

  public static registerPlayer(userId: number, gameId: number) {
    const newPlayer = new Player();
    newPlayer.userId = userId;
    newPlayer.gameId = gameId;
    newPlayer.playerStatus = PlayerStatus.waiting;

    return newPlayer;
  }

  public setFinishDate(date: Date) {
    this.finishDate = date;
    return;
  }

  public updatePlayerStatus(playerStatus: string) {
    this.playerStatus = playerStatus;
    return;
  }
  public updateScore(score: number) {
    this.score = score;
    return;
  }
}
