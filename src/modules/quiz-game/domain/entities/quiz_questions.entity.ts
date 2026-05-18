import { Column, Entity, OneToMany } from 'typeorm';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';
import { QuestionForGame } from './quiz_game_questions.entity';
import { PlayerAnswer } from './quiz_player_answers.entity';

@Entity({ name: 'QuizQuestions' })
export class Question extends BaseDbEntity {
  @Column({ type: 'varchar' })
  body: string;

  @Column({ type: 'simple-json' })
  answers: any[];

  @Column({ type: 'varchar', default: true })
  published: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedQuestionAt: Date;

  @OneToMany(() => QuestionForGame, (question) => question.question)
  questions: QuestionForGame[];

  @OneToMany(() => PlayerAnswer, (playerAnswer) => playerAnswer.question)
  playerAnswers: PlayerAnswer[];

  public static createQuestion(dto: {
    body: string;
    correctAnswers: string[];
  }): Question {
    const newQuestion = new Question();
    newQuestion.body = dto.body;
    newQuestion.answers = dto.correctAnswers;
    return newQuestion;
  }

  public updateQuestion(dto: { body: string; correctAnswers: string[] }) {
    this.body = dto.body;
    this.answers = dto.correctAnswers;
    this.updatedQuestionAt = new Date();
    return;
  }
  public publishAndUnpublishQuestion(status: string) {
    this.published = status;
    this.updatedQuestionAt = new Date();
    return;
  }
}
