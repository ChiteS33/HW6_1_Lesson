import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';
import { Player } from './quiz_players.entity';
import { Question } from './quiz_questions.entity';

@Entity({ name: 'QuizPlayerAnswers' })
export class PlayerAnswer extends BaseDbEntity {
  @Column({ type: 'integer' })
  playerId: number;

  @Column({ type: 'integer' })
  questionId: number;

  @Column({ type: 'varchar' })
  answer: string;

  @Column({ type: 'boolean' })
  isCorrect: boolean;

  @Column({ type: 'timestamp with time zone' })
  answeredAt: Date;

  @ManyToOne(() => Player, (player) => player.playerAnswers)
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @ManyToOne(() => Question, (q) => q.playerAnswers)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  public static createNewAnswer(dto: any) {
    const newAnswer = new PlayerAnswer();
    newAnswer.playerId = dto.playerId;
    newAnswer.questionId = dto.questionId;
    newAnswer.answer = dto.answer;
    newAnswer.isCorrect = dto.isCorrect;
    newAnswer.answeredAt = new Date();
    return newAnswer;
  }
}
