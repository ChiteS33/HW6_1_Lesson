import { Inject, Injectable } from '@nestjs/common';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { BlogsRepository } from '../repositories/blogsRepositories/blogs.repository';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { BlogEntityType } from '../repositories/entity-types/blogEntity.type';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}

  async findBlogById(blogId: string): Promise<BlogEntityType> {
    const foundBlog = await this.blogsRepository.findBlogByBlogId(blogId);
    if (!foundBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'blogId',
        message: 'Blog not found.',
      });
    }
    return foundBlog;
  }
}
