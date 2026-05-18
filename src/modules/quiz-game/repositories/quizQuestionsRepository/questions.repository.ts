import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../domain/entities/quiz_questions.entity';

@Injectable()
export class QuizQuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async save(question: Question): Promise<string> {
    const createdQuestion = await this.questionRepository.save(question);
    return createdQuestion.id.toString();
  }

  async findQuestionById(questionId: number): Promise<Question | null> {
    return this.questionRepository.findOne({
      where: { id: questionId },
    });
  }

  async takeRandomQuestions(): Promise<Question[]> {
    return this.questionRepository
      .createQueryBuilder('question')
      .where('question.published = :status', { status: 'true' })
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();
  }

  async delete(questionId: number): Promise<void> {
    await this.questionRepository.delete(questionId);
    return;
  }
}
