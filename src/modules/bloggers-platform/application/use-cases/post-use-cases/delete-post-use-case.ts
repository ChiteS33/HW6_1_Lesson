import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostService } from '../../posts.service';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(PostService) private postService: PostService,
  ) {}

  async execute(command: DeletePostCommand): Promise<void> {
    await this.postService.findPostById(command.postId);
    await this.postsRepository.deletePostById(command.postId);
    return;
  }
}
