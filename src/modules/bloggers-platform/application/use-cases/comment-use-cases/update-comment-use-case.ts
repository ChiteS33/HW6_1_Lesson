import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsService } from '../../comments.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { CommentEntityType } from '../../../../user-accounts/repositories/entity-types/comment/commentEntity.type';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public content: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @Inject(CommentsService) private commentsService: CommentsService,
    @Inject(CommentsRepository) private commentsRepository: CommentsRepository,
  ) {}
  async execute(command: UpdateCommentCommand): Promise<void> {
    const foundComment: CommentEntityType =
      await this.commentsService.findCommentById(command.commentId);
    if (foundComment.userId !== +command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'jwtToken',
        message: 'You dont have permission to update a comment',
      });
    }
    await this.commentsRepository.updateComment(
      command.commentId,
      command.content,
    );
    return;
  }
}
