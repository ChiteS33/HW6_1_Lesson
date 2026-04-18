import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsService } from '../../comments.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { Comment } from '../../../domain/entities/comments.entity';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public content: string,
    public userId: number,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @Inject(CommentsService) private commentsService: CommentsService,
    @Inject(CommentsRepository) private commentsRepository: CommentsRepository,
  ) {}
  async execute(command: UpdateCommentCommand): Promise<void> {
    const foundComment = await this.findCommentById(command.commentId);

    if (foundComment.userId !== command.userId)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'jwtToke',
        message: "'You dont have permission to update a comment'",
      });

    foundComment.updateComment(command.content);

    await this.commentsRepository.save(foundComment);
    return;
  }
  private async findCommentById(commentId: string): Promise<Comment> {
    const foundComment = await this.commentsRepository.findCommentById(
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
