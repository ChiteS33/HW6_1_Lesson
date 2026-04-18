import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { Post } from '../../../domain/entities/posts.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject(PostsRepository) private postsRepository: PostsRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<void> {
    await this.findPostById(command.postId);
    await this.postsRepository.deletePostById(Number(command.postId));
    return;
  }
  private async findPostById(postId: string): Promise<Post> {
    const foundPost = await this.postsRepository.findPostsById(Number(postId));
    if (!foundPost.foundPost)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'postId',
        message: 'Post not found',
      });
    return foundPost.foundPost;
  }
}
