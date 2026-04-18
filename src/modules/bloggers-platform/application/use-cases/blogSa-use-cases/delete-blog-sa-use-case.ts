import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';
import { Blog } from '../../../domain/entities/blogs.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteBlogSaCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogSaCommand)
export class DeleteBlogSaUseCase implements ICommandHandler<DeleteBlogSaCommand> {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: DeleteBlogSaCommand): Promise<void> {
    await this.findBlogById(command.blogId);
    await this.blogsRepository.deleteBlogById(Number(command.blogId));
    return;
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
