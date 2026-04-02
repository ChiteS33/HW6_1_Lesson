import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeDislikeStatus } from '../../../domain/entities/posts.entity';
import { PostService } from '../../posts.service';
import { LikesForPostRepository } from '../../../repositories/likesForPostRepositories/post.likes.repository';
import { LikeEntityForPostType } from '../../../repositories/entity-types/likeEntityForPost.type';

export class SetLikePostCommand {
  constructor(
    public postId: string,
    public likeStatus: LikeDislikeStatus,
    public user: any,
  ) {}
}

@CommandHandler(SetLikePostCommand)
export class SetLikePostUseCase implements ICommandHandler<SetLikePostCommand> {
  constructor(
    @Inject(PostService) private postService: PostService,
    @Inject(LikesForPostRepository)
    private likesForPostRepository: LikesForPostRepository,
  ) {}
  async execute(command: SetLikePostCommand): Promise<void> {
    await this.postService.findPostById(command.postId);
    const foundPostLike: LikeEntityForPostType[] =
      await this.likesForPostRepository.findLikeByUserIdAndPostId(
        command.user.id,
        command.postId,
      );
    if (!foundPostLike[0]) {
      await this.likesForPostRepository.createLikeForPost(
        command.user.id,
        command.user.login,
        command.postId,
        command.likeStatus,
      );
      return;
    }
    await this.likesForPostRepository.updateLikeForPost(
      command.user.id,
      command.postId,
      command.likeStatus,
    );
    return;
  }
}
