import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuizQuestionsQueryRepository } from '../../../repositories/quizQuestionsRepository/questions.queryRepository';
import { Inject } from '@nestjs/common';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { questionMapper } from '../../../mappers/questions/questionMapper';
import { QuestionView } from '../../../api/view_types/questions/questionView.type';
import { Question } from '../../../domain/entities/quiz_questions.entity';

export class GetQuizQuestionByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetQuizQuestionByIdQuery)
export class GetQuizQuestionByIdQueryHandler implements IQueryHandler<GetQuizQuestionByIdQuery> {
  constructor(
    @Inject(QuizQuestionsQueryRepository)
    private queryRepository: QuizQuestionsQueryRepository,
  ) {}

  async execute(query: GetQuizQuestionByIdQuery): Promise<QuestionView> {
    const foundQuestion: Question | null =
      await this.queryRepository.findQuestionById(Number(query.id));

    if (!foundQuestion) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'questionId',
        message: 'Question not found.',
      });
    }

    return questionMapper(foundQuestion);
  }
}
