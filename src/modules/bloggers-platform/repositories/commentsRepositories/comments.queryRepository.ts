import { Injectable } from '@nestjs/common';
import { paginationValuesForRepo } from '../../../../core/mappers/paginationValuesMakerMapper';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TotalCount } from '../../../../core/types/totalCount.type';
import { CommentEntityWithLikeCounterType } from '../entity-types/commentEntityWithLikeStatus.type';
import { LikeDislikeStatus } from '../../domain/entities/posts.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findLikeStatusForComment(
    commentId: string,
    userId: string,
  ): Promise<LikeDislikeStatus> {
    const kekw: [{ status: LikeDislikeStatus }] = await this.dataSource.query(
      `SELECT "status"
    FROM "LikesForComments" l
    WHERE l."commentId" = $1 AND l."userId" = $2`,
      [commentId, userId],
    );
    return kekw[0]?.status ?? LikeDislikeStatus.none;
  }

  async findCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentEntityWithLikeCounterType> {
    const foundComment: CommentEntityWithLikeCounterType[] =
      await this.dataSource.query(
        `SELECT
         c.*,
         COUNT(*) FILTER (WHERE l."status" = 'Like')::int AS likes_count,
         COUNT(*) FILTER (WHERE l."status" = 'Dislike')::int AS dislikes_count
    FROM "Comments" c
    LEFT JOIN "LikesForComments" l
    ON l."commentId" = c."id"
    WHERE c."id" = $1
    GROUP BY c."id";`,
        [commentId],
      );
    return foundComment[0];
  }

  async findAllCommentsByPostId(
    postId: string,
    paginationValues: paginationValuesForRepo,
  ): Promise<{
    foundCommentsWithLikeCounter: CommentEntityWithLikeCounterType[];
    totalCount: TotalCount[];
  }> {
    const skip = (paginationValues.pageNumber - 1) * paginationValues.pageSize;
    const limit = paginationValues.pageSize;
    const allowedSortFields = [
      'id',
      'title',
      'shortDescription',
      'content',
      'blogId',
      'blogName',
      'createdAt',
    ];
    const allowedDirections = ['ASC', 'DESC'];
    const safeSortBy = allowedSortFields.includes(paginationValues.sortBy)
      ? paginationValues.sortBy
      : 'createdAt';
    const safeSortDirection = allowedDirections.includes(
      paginationValues.sortDirection.toUpperCase(),
    )
      ? paginationValues.sortDirection.toUpperCase()
      : 'DESC';

    const foundCommentsWithLikeCounter: CommentEntityWithLikeCounterType[] =
      await this.dataSource.query(
        `SELECT *
      FROM "Comments" c
      WHERE c."postId" = $1
      ORDER BY "${safeSortBy}" ${safeSortDirection}
      LIMIT $2 OFFSET $3`,
        [postId, limit, skip],
      );

    const totalCount: TotalCount[] = await this.dataSource.query(
      `SELECT COUNT(*) :: int as count
     FROM "Comments" c
     WHERE c."postId" = $1`,
      [postId],
    );
    return { foundCommentsWithLikeCounter, totalCount };
  }
}
