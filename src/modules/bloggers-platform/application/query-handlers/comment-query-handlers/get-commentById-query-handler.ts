import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { commentsViewMapperWithCount } from '../../../mappers/comment/commentsViewMapperWithCount';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { LikesForCommentRepository } from '../../../repositories/likesForCommentRepositories/comment.likes.repository';
import { LikeDislikeStatus } from '../../../../../core/types/enumLikeOrDislike.type';
import { CommentViewType } from '../../../api/view-types/comments/commentView.type';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { Comment } from '../../../domain/entities/comments.entity';
import { LikesForComment } from '../../../domain/entities/likesForComments.entity';

export class FindCommentByIdQuery {
  constructor(
    public commentId: string,
    public userId?: number,
  ) {}
}

@QueryHandler(FindCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<FindCommentByIdQuery> {
  constructor(
    @Inject(CommentsRepository) private commentRepository: CommentsRepository,
    @Inject(LikesForCommentRepository)
    private likesForCommentRepository: LikesForCommentRepository,
  ) {}
  async execute(query: FindCommentByIdQuery): Promise<CommentViewType> {
    const foundComment: Comment = await this.findCommentById(query.commentId);

    const counters: {
      commentId: number;
      likesCount: number;
      dislikesCount: number;
    }[] = await this.commentRepository.findCounters([Number(query.commentId)]);

    let myStatus = {
      commentId: Number(query.commentId),
      status: LikeDislikeStatus.none,
    };

    if (!query.userId) {
      return commentsViewMapperWithCount(foundComment, counters[0], myStatus);
    }

    const foundLikeForComment: LikesForComment | null =
      await this.likesForCommentRepository.findLikeByUserIdAndCommentId(
        query.userId,
        Number(query.commentId),
      );

    if (!foundLikeForComment) {
      return commentsViewMapperWithCount(foundComment, counters[0], myStatus);
    }
    myStatus = {
      commentId: Number(query.commentId),
      status: foundLikeForComment.status as LikeDislikeStatus,
    };

    return commentsViewMapperWithCount(foundComment, counters[0], myStatus);
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
