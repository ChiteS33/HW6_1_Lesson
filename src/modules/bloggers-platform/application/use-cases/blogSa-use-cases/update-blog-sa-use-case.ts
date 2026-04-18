import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog, BlogInputDto } from '../../../domain/entities/blogs.entity';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdateBlogSaCommand {
  constructor(
    public blogId: string,
    public blogInputDto: BlogInputDto,
  ) {}
}

@CommandHandler(UpdateBlogSaCommand)
export class UpdateBlogSaUseCase implements ICommandHandler<UpdateBlogSaCommand> {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: UpdateBlogSaCommand): Promise<void> {
    const foundBlog = await this.findBlogById(command.blogId);
    foundBlog.updateBlog(command.blogInputDto);
    await this.blogsRepository.save(foundBlog);
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
