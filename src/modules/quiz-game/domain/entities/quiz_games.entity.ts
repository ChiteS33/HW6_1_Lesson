import { Column, Entity, OneToMany } from 'typeorm';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';
import { QuestionForGame } from './quiz_game_questions.entity';
import { Player } from './quiz_players.entity';
import { GameStatus } from './quiz_players.entity';

@Entity({ name: 'QuizGames' })
export class Game extends BaseDbEntity {
  @Column({ type: 'varchar' })
  gameStatus: GameStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startGame: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endGame: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  pairCreatedDate: Date | null;

  @Column({ type: 'integer', default: 2 })
  maxPlayers: number;

  @OneToMany(() => QuestionForGame, (question) => question.game)
  questions: QuestionForGame[];

  @OneToMany(() => Player, (player) => player.game, { cascade: false })
  players: Player[];

  public static createGame(): Game {
    const newGame = new Game();
    newGame.gameStatus = GameStatus.PendingSecondPlayer;
    newGame.startGame = null;
    newGame.endGame = null;
    newGame.pairCreatedDate = new Date();
    newGame.maxPlayers = 2;
    return newGame;
  }
  public updateGame() {
    this.gameStatus = GameStatus.Active;
    this.startGame = new Date();
    this.pairCreatedDate = new Date();
    return;
  }
  public updateGameStatus(gameStatus: GameStatus) {
    this.gameStatus = gameStatus;
    return;
  }

  public finishedGame(gameStatus: GameStatus) {
    this.gameStatus = gameStatus;
    this.endGame = new Date();
    return;
  }
}

//
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiaWF0IjoxNzc4ODQ3ODI3LCJleHAiOjE3Nzg4NTUwMjd9.NJgoNhwijTva7OHscJspXnorWXCi43sI7Gxk3K9jArU
//
