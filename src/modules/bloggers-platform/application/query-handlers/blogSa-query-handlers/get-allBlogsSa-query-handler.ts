import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../../repositories/blogsRepositories/blogs.queryRepository';
import { Inject } from '@nestjs/common';
import { InputQueryPaginationTypeWithSearchName } from '../../../../../core/pagination/inputQueryPaginationTypeWithSearchName';
import { FinalViewWithPaginationType } from '../../../../../core/types/finalViewWithPagination.type';
import { BlogViewType } from '../../../api/view-types/blogs/blogView.type';
import { PaginationViewType } from '../../../../../core/types/paginationViewType';
import { paginationValuesMakerWithSearchNameTermMapper } from '../../../../../core/mappers/paginationValuesMakerWithSearchNameTermMapper';
import { blogViewMapperWithPagination } from '../../../mappers/blog/blogViewMapperWithPagination';
import { blogViewMapper } from '../../../mappers/blog/blogViewMapper';

export class GetAllBlogsSaQuery {
  constructor(public query: InputQueryPaginationTypeWithSearchName) {}
}

@QueryHandler(GetAllBlogsSaQuery)
export class GetAllBlogsSaQueryHandler implements IQueryHandler<GetAllBlogsSaQuery> {
  constructor(
    @Inject(BlogsQueryRepository)
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async execute(
    query: GetAllBlogsSaQuery,
  ): Promise<FinalViewWithPaginationType<BlogViewType>> {
    const paginationValues = paginationValuesMakerWithSearchNameTermMapper(
      query.query,
    );
    const foundBlogs =
      await this.blogsQueryRepository.getAllBlogs(paginationValues);

    const params: PaginationViewType = {
      pagesCount: Math.ceil(foundBlogs.totalCount / paginationValues.pageSize),
      page: paginationValues.pageNumber,
      pageSize: paginationValues.pageSize,
      totalCount: foundBlogs.totalCount,
    };
    return blogViewMapperWithPagination(
      foundBlogs.foundBlogs.map(blogViewMapper),
      params,
    );
  }
}
