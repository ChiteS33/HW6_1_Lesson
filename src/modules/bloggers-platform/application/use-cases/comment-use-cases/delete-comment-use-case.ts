import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsService } from '../../comments.service';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { LikesForCommentRepository } from '../../../repositories/likesForCommentRepositories/comment.likes.repository';
import { Comment } from '../../../domain/entities/comments.entity';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: number,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    @Inject(CommentsService) private commentsService: CommentsService,
    @Inject(CommentsRepository) private commentsRepository: CommentsRepository,
    @Inject(LikesForCommentRepository)
    private likesForCommentRepository: LikesForCommentRepository,
  ) {}
  async execute(command: DeleteCommentCommand): Promise<void> {
    const foundComment: Comment = await this.findCommentById(
      Number(command.commentId),
    );

    if (foundComment.userId !== +command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'jwtToken',
        message: 'You dont have permission to delete a comment',
      });
    }
    await this.likesForCommentRepository.deleteLikesForComment(
      Number(command.commentId),
    );
    await this.commentsRepository.deleteComment(Number(command.commentId));
  }

  private async findCommentById(commentId: number): Promise<Comment> {
    const foundComment =
      await this.commentsRepository.findCommentById(commentId);
    if (!foundComment)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'commentId',
        message: 'Comment not found',
      });
    return foundComment;
  }
}
