import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { CommentsRepository } from '../repositories/commentsRepositories/comments.repository';
import { CommentEntityType } from '../../user-accounts/repositories/entity-types/comment/commentEntity.type';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(CommentsRepository) private commentsRepository: CommentsRepository,
  ) {}

  async findCommentById(commentId: string): Promise<CommentEntityType> {
    const foundedComment: CommentEntityType =
      await this.commentsRepository.findCommentById(commentId);
    if (!foundedComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'commentId',
        message: 'Comment not found',
      });
    }
    return foundedComment;
  }
}
