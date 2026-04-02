import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputDto } from '../../../domain/entities/blogs.entity';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';
import { BlogsQueryRepository } from '../../../repositories/blogsRepositories/blogs.queryRepository';
import { BlogViewType } from '../../../api/view-types/blogs/blogView.type';

export class CreateBlogSaCommand {
  constructor(public blogInputDto: BlogInputDto) {}
}

@CommandHandler(CreateBlogSaCommand)
export class CreateBlogSaUseCase implements ICommandHandler<CreateBlogSaCommand> {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @Inject(BlogsQueryRepository)
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async execute(command: CreateBlogSaCommand): Promise<BlogViewType> {
    const createdBlogId = await this.blogsRepository.createBlog(
      command.blogInputDto,
    );
    return await this.blogsQueryRepository.getBlogById(createdBlogId);
  }
}
