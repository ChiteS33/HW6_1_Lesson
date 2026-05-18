import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { QuizQuestionsQueryRepository } from '../../../repositories/quizQuestionsRepository/questions.queryRepository';
import { PaginationViewType } from '../../../../../core/types/paginationViewType';
import { FinalViewWithPaginationType } from '../../../../../core/types/finalViewWithPagination.type';
import { questionMapper } from '../../../mappers/questions/questionMapper';
import { QuestionView } from '../../../api/view_types/questions/questionView.type';
import { QuestionInputQueryDto } from '../../../api/input_dto_types/questions/questions_inputQueryDto.type';
import { PublishedStatus } from '../../../../../core/types/enumPublished.type';

export class GetAllQuestionsQuery {
  constructor(public query: QuestionInputQueryDto) {}
}

@QueryHandler(GetAllQuestionsQuery)
export class GetAllQuizQuestionsQueryHandler implements IQueryHandler<GetAllQuestionsQuery> {
  constructor(
    @Inject(QuizQuestionsQueryRepository)
    private quizQuestionsQueryRepository: QuizQuestionsQueryRepository,
  ) {}

  async execute(
    query: GetAllQuestionsQuery,
  ): Promise<FinalViewWithPaginationType<QuestionView>> {
    const paginationValues = {
      bodySearchTerm: query.query.bodySearchTerm ?? null,
      publishedStatus: query.query.publishedStatus ?? PublishedStatus.all,
      sortBy: query.query.sortBy ?? 'createdAt',
      sortDirection: query.query.sortDirection ?? 'desc',
      pageNumber: query.query.pageNumber ? Number(query.query.pageNumber) : 1,
      pageSize: query.query.pageSize ? Number(query.query.pageSize) : 10,
    };
    const foundQuestions =
      await this.quizQuestionsQueryRepository.findAllQuestions(
        paginationValues,
      );
    const params: PaginationViewType = {
      pagesCount: Math.ceil(
        foundQuestions.totalCount / paginationValues.pageSize,
      ),
      page: paginationValues.pageNumber,
      pageSize: paginationValues.pageSize,
      totalCount: foundQuestions.totalCount,
    };

    return viewMapperWithPagination(
      foundQuestions.foundQuestions.map(questionMapper),
      params,
    );
  }
}

export const viewMapperWithPagination = <T>(
  anyTarget: T[],
  paginationValues: PaginationViewType,
): FinalViewWithPaginationType<T> => {
  return {
    pagesCount: paginationValues.pagesCount,
    page: paginationValues.page,
    pageSize: paginationValues.pageSize,
    totalCount: paginationValues.totalCount,
    items: anyTarget,
  };
};
