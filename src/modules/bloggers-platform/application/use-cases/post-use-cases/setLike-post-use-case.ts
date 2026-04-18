import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesForPostRepository } from '../../../repositories/likesForPostRepositories/post.likes.repository';
import { User } from '../../../../user-accounts/domain/entities/users.entity';
import { LikeForPost } from '../../../domain/entities/likesForPosts.entity';
import { LikeDislikeStatus } from '../../../../../core/types/enumLikeOrDislike.type';
import { Post } from '../../../domain/entities/posts.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';

export class SetLikePostCommand {
  constructor(
    public postId: string,
    public likeStatus: LikeDislikeStatus,
    public user: User,
  ) {}
}

@CommandHandler(SetLikePostCommand)
export class SetLikePostUseCase implements ICommandHandler<SetLikePostCommand> {
  constructor(
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(LikesForPostRepository)
    private likesForPostRepository: LikesForPostRepository,
  ) {}
  async execute(command: SetLikePostCommand): Promise<void> {
    await this.findPostById(command.postId);
    const foundPostLike: LikeForPost | null =
      await this.likesForPostRepository.findLikeByUserIdAndPostId(
        Number(command.user.id),
        Number(command.postId),
      );
    if (!foundPostLike) {
      const createLikeForPost: LikeForPost = LikeForPost.createLikeForPost(
        Number(command.postId),
        command.likeStatus,
        command.user,
      );
      await this.likesForPostRepository.save(createLikeForPost);
      return;
    }
    foundPostLike.updateLikeForPost(command.likeStatus);
    await this.likesForPostRepository.save(foundPostLike);
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
