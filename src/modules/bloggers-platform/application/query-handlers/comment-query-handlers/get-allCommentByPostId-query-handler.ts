import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortDirection } from '../../../../../core/types/enumSortDirection.type';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { Post } from '../../../domain/entities/posts.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import {
  paginationValuesForRepo,
  paginationValuesMakerMapper,
} from '../../../../../core/mappers/paginationValuesMakerMapper';

import { CommentsQueryRepository } from '../../../repositories/commentsRepositories/comments.queryRepository';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { Comment } from '../../../domain/entities/comments.entity';
import { commentsViewMapperWithCount } from '../../../mappers/comment/commentsViewMapperWithCount';
import { paginationViewMapper } from '../blogSa-query-handlers/get-allPostsByBlogIdSa-query-handler';
import { commentsViewMapperWithPagination } from '../../../mappers/comment/commentsViewMapperWithPagination';
import { CommentViewType } from '../../../api/view-types/comments/commentView.type';

export class FindAllCommentsByPostIdQuery {
  constructor(
    public postId: string,
    public query: InputQueryPaginationType,
    public userId?: number,
  ) {}
}
@QueryHandler(FindAllCommentsByPostIdQuery)
export class FindAllCommentsByPostIdQueryHandler implements IQueryHandler<FindAllCommentsByPostIdQuery> {
  constructor(
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
    @Inject(CommentsRepository) private commentsRepository: CommentsRepository,
  ) {}

  async execute(query: FindAllCommentsByPostIdQuery): Promise<any> {
    await this.findPostById(query.postId);
    const paginationValues: paginationValuesForRepo =
      paginationValuesMakerMapper(query.query);

    const foundAllComments: {
      foundComments: Comment[];
      totalCount: number;
    } = await this.commentsQueryRepository.findAllCommentsByPostId(
      Number(query.postId),
      paginationValues,
    );

    const idsArray: number[] = foundAllComments.foundComments.map(
      (comment) => comment.id,
    );

    const foundLikes: {
      commentId: number;
      likesCount: number;
      dislikesCount: number;
    }[] = await this.commentsRepository.findCounters(idsArray);

    const foundStatuses: { commentId: number; status: string }[] = query.userId
      ? await this.commentsRepository.findLikeStatus(idsArray, query.userId)
      : [];

    const commentViews: CommentViewType[] = foundAllComments.foundComments.map(
      (foundComment: Comment) => {
        const likesAndDislikesCount = foundLikes.find(
          (likeElement: {
            commentId: number;
            likesCount: number;
            dislikesCount: number;
          }) => likeElement.commentId === foundComment.id,
        );
        const status = foundStatuses.find(
          (status: { commentId: number; status: string }) =>
            status.commentId === foundComment.id,
        );

        return commentsViewMapperWithCount(
          foundComment,
          likesAndDislikesCount!,
          status!,
        );
      },
    );

    const params = paginationViewMapper(
      paginationValues,
      foundAllComments.totalCount,
    );
    return commentsViewMapperWithPagination(commentViews, params);
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

export class InputQueryPaginationType {
  @IsOptional()
  @IsString()
  pageNumber?: string;
  @IsOptional()
  @IsString()
  pageSize?: string;
  @IsOptional()
  @IsString()
  sortBy?: string;
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}
