import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsService } from '../../comments.service';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { CommentEntityType } from '../../../../user-accounts/repositories/entity-types/comment/commentEntity.type';
import { LikesForCommentRepository } from '../../../repositories/likesForCommentRepositories/comment.likes.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
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
    const foundComment: CommentEntityType =
      await this.commentsService.findCommentById(command.commentId);

    if (foundComment.userId !== +command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'jwtToken',
        message: 'You dont have permission to delete a comment',
      });
    }
    await this.likesForCommentRepository.deleteLikesForComment(
      command.commentId,
    );
    await this.commentsRepository.deleteComment(command.commentId);
  }
}
