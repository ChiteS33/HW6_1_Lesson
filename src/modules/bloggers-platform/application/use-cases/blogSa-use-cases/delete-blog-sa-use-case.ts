import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '../../blogs.service';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';

export class DeleteBlogSaCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogSaCommand)
export class DeleteBlogSaUseCase implements ICommandHandler<DeleteBlogSaCommand> {
  constructor(
    @Inject(BlogsService) private blogsService: BlogsService,
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: DeleteBlogSaCommand): Promise<void> {
    await this.blogsService.findBlogById(command.blogId);
    await this.blogsRepository.deleteBlogById(command.blogId);
    return;
  }
}
