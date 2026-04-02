import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '../../blogs.service';
import { BlogInputDto } from '../../../domain/entities/blogs.entity';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';

export class UpdateBlogSaCommand {
  constructor(
    public blogId: string,
    public blogInputDto: BlogInputDto,
  ) {}
}

@CommandHandler(UpdateBlogSaCommand)
export class UpdateBlogSaUseCase implements ICommandHandler<UpdateBlogSaCommand> {
  constructor(
    @Inject(BlogsService) private blogsService: BlogsService,
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: UpdateBlogSaCommand): Promise<void> {
    await this.blogsService.findBlogById(command.blogId);
    await this.blogsRepository.updateBlog(command.blogInputDto, command.blogId);
    return;
  }
}
