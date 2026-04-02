import { Inject, Injectable } from '@nestjs/common';

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeDislikeStatus } from '../../domain/entities/posts.entity';
import { BlogsService } from '../../application/blogs.service';
import { paginationValuesForRepo } from '../../../../core/mappers/paginationValuesMakerMapper';
import { TotalCount } from '../../../../core/types/totalCount.type';
import { PostEntityWithLikeCounterType } from '../entity-types/postEntity.type';
import { LikeEntityForPostType } from '../entity-types/likeEntityForPost.type';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @Inject(BlogsService) private blogsService: BlogsService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findLikeStatusForPost(
    postId: string,
    userId?: string,
  ): Promise<LikeDislikeStatus> {
    const result = await this.dataSource.query(
      `SELECT "status"
   FROM "LikesForPosts" l
   WHERE "postId" = $1 AND "userId" = $2`,
      [postId, userId],
    );
    return result[0]?.status ?? LikeDislikeStatus.none;
  }

  async findAllPosts(
    paginationValues: paginationValuesForRepo,
    userId?: string,
  ): Promise<{
    foundPostsWithLikeCounter: PostEntityWithLikeCounterType[];
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

    const foundPosts: PostEntityWithLikeCounterType[] =
      await this.dataSource.query(
        `SELECT *
      FROM "Posts" p
      ORDER BY "${safeSortBy}" ${safeSortDirection}
      LIMIT ${limit} OFFSET ${skip}`,
      );

    const totalCount: TotalCount[] = await this.dataSource.query(
      `SELECT COUNT(*) :: int as count
     FROM "Posts"`,
    );

    return { foundPostsWithLikeCounter: foundPosts, totalCount };
  }

  async findNewestLikesForPost(
    postId: string,
  ): Promise<LikeEntityForPostType[]> {
    return await this.dataSource.query(
      `SELECT *
      FROM "LikesForPosts" l
      WHERE l."postId" = $1 AND l."status" = $2
       ORDER BY "createdAt" DESC
       LIMIT 3`,
      [postId, 'Like'],
    );
  }

  async findPostByPostId(postId: string): Promise<{
    foundPost: PostEntityWithLikeCounterType;
    newestLikes: LikeEntityForPostType[];
  }> {
    const foundPost: PostEntityWithLikeCounterType[] =
      await this.dataSource.query(
        `SELECT
                 p.*,
         COUNT(*) FILTER (WHERE l."status" = 'Like')::int AS likes_count,
         COUNT(*) FILTER (WHERE l."status" = 'Dislike')::int AS dislikes_count
    FROM "Posts" p
    LEFT JOIN "LikesForPosts" l
    ON l."postId" = p."id"
    WHERE p."id" = $1
    GROUP BY p."id";`,
        [postId],
      );
    const newestLikes = await this.findNewestLikesForPost(postId);
    return { foundPost: foundPost[0], newestLikes };
  }

  async findAllPostsByBlogId(
    blogId: string,
    pagination: paginationValuesForRepo,
    userId?: string,
  ): Promise<{
    foundPosts: PostEntityWithLikeCounterType[];
    totalCount: TotalCount[];
  }> {
    await this.blogsService.findBlogById(blogId);
    const skip = (pagination.pageNumber - 1) * pagination.pageSize;
    const limit = pagination.pageSize;
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
    const safeSortBy = allowedSortFields.includes(pagination.sortBy)
      ? pagination.sortBy
      : 'createdAt';
    const safeSortDirection = allowedDirections.includes(
      pagination.sortDirection.toUpperCase(),
    )
      ? pagination.sortDirection.toUpperCase()
      : 'DESC';

    const foundPosts: PostEntityWithLikeCounterType[] =
      await this.dataSource.query(
        `SELECT * 
    FROM "Posts" 
    WHERE "blogId" = $1
    ORDER BY "${safeSortBy}" ${safeSortDirection}
    LIMIT $2 OFFSET $3`,
        [blogId, limit, skip],
      );
    const totalCount: TotalCount[] = await this.dataSource.query(
      `SELECT COUNT(*) :: int as count
      FROM "Posts"
      WHERE "blogId" = $1`,
      [blogId],
    );
    return { foundPosts, totalCount };
  }
}
