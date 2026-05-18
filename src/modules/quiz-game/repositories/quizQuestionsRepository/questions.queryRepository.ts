import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../domain/entities/quiz_questions.entity';

@Injectable()
export class QuizQuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private quizQuestionRepository: Repository<Question>,
  ) {}

  async findAllQuestions(paginationValues: any): Promise<{
    foundQuestions: Question[];
    totalCount: number;
  }> {
    const skip = (paginationValues.pageNumber - 1) * paginationValues.pageSize;
    const limit: number = paginationValues.pageSize;
    const allowedSortFields = [
      'id',
      'body',
      'answers',
      'createdAt',
      'updatedAt',
      'published',
    ];

    const safeSortBy = allowedSortFields.includes(paginationValues.sortBy)
      ? paginationValues.sortBy
      : 'createdAt';
    const sortDirection =
      paginationValues.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const queryBuilder = this.quizQuestionRepository
      .createQueryBuilder('questions')
      .orderBy(`questions.${safeSortBy}`, sortDirection)
      .offset(skip)
      .limit(limit);

    const foundQuestions = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();
    return { foundQuestions, totalCount };
  }
  async findQuestionById(id: number): Promise<Question | null> {
    return this.quizQuestionRepository
      .createQueryBuilder('question')
      .where('question.id = :id', { id })
      .getOne();
  }
}
