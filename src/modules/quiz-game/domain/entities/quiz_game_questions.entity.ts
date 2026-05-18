import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';
import { Game } from './quiz_games.entity';
import { PlayerAnswer } from './quiz_player_answers.entity';
import { Question } from './quiz_questions.entity';

@Entity({ name: 'QuizQuestionForGame' })
export class QuestionForGame extends BaseDbEntity {
  @Column({ type: 'integer' })
  gameId: number;

  @Column({ type: 'integer' })
  questionId: number;

  @Column({ type: 'integer' })
  orderIndex: number;

  @Column({ type: 'boolean' })
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  updatedQuestionAt: Date;

  @ManyToOne(() => Game, (game) => game.questions)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @OneToMany(() => PlayerAnswer, (playerAnswer) => playerAnswer.question)
  playerAnswers: PlayerAnswer[];

  @ManyToOne(() => Question, (questin) => questin.questions)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  public static createQuestionPack(gameId: number, questionIds: number[]) {
    const kekw = questionIds.map((qId, index) => {
      const entity = new QuestionForGame();
      entity.gameId = gameId;
      entity.questionId = qId;
      entity.orderIndex = index + 1;
      entity.isActive = true;
      return entity;
    });

    return kekw;
  }
}
