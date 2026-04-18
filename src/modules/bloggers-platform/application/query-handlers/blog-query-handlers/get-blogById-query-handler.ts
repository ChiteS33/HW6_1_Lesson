import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BlogViewType } from '../../../api/view-types/blogs/blogView.type';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { blogViewMapper } from 'src/modules/bloggers-platform/mappers/blog/blogViewMapper';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';
import { Blog } from '../../../domain/entities/blogs.entity';

export class GetBlogsByBlogIdQuery {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogsByBlogIdQuery)
export class GetBlogsByBlogIdQueryHandler implements IQueryHandler<GetBlogsByBlogIdQuery> {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}
  async execute(query: GetBlogsByBlogIdQuery): Promise<BlogViewType> {
    const foundBlog = await this.findBlogById(query.blogId);

    return blogViewMapper(foundBlog);
  }

  private async findBlogById(blogId: string): Promise<Blog> {
    const foundBlog = await this.blogsRepository.findBlogByBlogId(
      Number(blogId),
    );
    if (!foundBlog)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'blogId',
        message: 'Blog not found',
      });
    return foundBlog;
  }
}
