import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesForCommentRepository } from '../../../repositories/likesForCommentRepositories/comment.likes.repository';
import { LikeDislikeStatus } from '../../../../../core/types/enumLikeOrDislike.type';
import { User } from '../../../../user-accounts/domain/entities/users.entity';
import { LikesForComment } from '../../../domain/entities/likesForComments.entity';
import { Comment } from '../../../domain/entities/comments.entity';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class SetLikeCommentsCommand {
  constructor(
    public commentId: string,
    public likeStatus: LikeDislikeStatus,
    public user: User,
  ) {}
}

@CommandHandler(SetLikeCommentsCommand)
export class SetLikeCommentsUseCase implements ICommandHandler<SetLikeCommentsCommand> {
  constructor(
    @Inject(CommentsRepository) private commentRepository: CommentsRepository,
    @Inject(LikesForCommentRepository)
    private likesForCommentRepository: LikesForCommentRepository,
  ) {}
  async execute(command: SetLikeCommentsCommand): Promise<void> {
    await this.findCommentById(command.commentId);

    const foundCommentLike =
      await this.likesForCommentRepository.findLikeByUserIdAndCommentId(
        command.user.id,
        Number(command.commentId),
      );

    if (!foundCommentLike) {
      const newLike = LikesForComment.createLikeForComment(
        Number(command.commentId),
        command.likeStatus,
        command.user,
      );
      await this.likesForCommentRepository.save(newLike);
      return;
    }

    foundCommentLike.updateLikeForComment(command.likeStatus);
    await this.likesForCommentRepository.save(foundCommentLike);

    return;
  }

  private async findCommentById(commentId: string): Promise<Comment> {
    const foundComment = await this.commentRepository.findCommentById(
      Number(commentId),
    );
    if (!foundComment)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'commentId',
        message: 'Comment not found',
      });
    return foundComment;
  }
}
