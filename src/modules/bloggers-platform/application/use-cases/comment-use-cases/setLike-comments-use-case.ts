import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeDislikeStatus } from '../../../domain/entities/posts.entity';
import { CommentsService } from '../../comments.service';
import { LikesForCommentRepository } from '../../../repositories/likesForCommentRepositories/comment.likes.repository';
import { LikeEntityForCommentType } from '../../../repositories/entity-types/likeEntityForComment.type';

export class SetLikeCommentsCommand {
  constructor(
    public commentId: string,
    public likeStatus: LikeDislikeStatus,
    public user: any,
  ) {}
}

@CommandHandler(SetLikeCommentsCommand)
export class SetLikeCommentsUseCase implements ICommandHandler<SetLikeCommentsCommand> {
  constructor(
    @Inject(CommentsService) private commentsService: CommentsService,
    @Inject(LikesForCommentRepository)
    private likesForCommentRepository: LikesForCommentRepository,
  ) {}
  async execute(command: SetLikeCommentsCommand): Promise<void> {
    await this.commentsService.findCommentById(command.commentId);

    const foundCommentLike: LikeEntityForCommentType =
      await this.likesForCommentRepository.findLikeByUserIdAndCommentId(
        command.user.id,
        command.commentId,
      );

    if (!foundCommentLike) {
      await this.likesForCommentRepository.createLike(
        command.user.id,
        command.user.login,
        command.commentId,
        command.likeStatus,
      );
      return;
    }
    await this.likesForCommentRepository.updateLikeForComment(
      command.commentId,
      command.likeStatus,
    );
    return;
  }
}
