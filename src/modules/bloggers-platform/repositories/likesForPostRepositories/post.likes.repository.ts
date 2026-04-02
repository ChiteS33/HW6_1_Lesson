import { Injectable } from '@nestjs/common';

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeEntityForPostType } from '../entity-types/likeEntityForPost.type';
import { LikeDislikeStatus } from '../../domain/entities/posts.entity';
import { InsertReturningType } from '../../../../core/types/id.type';

@Injectable()
export class LikesForPostRepository {
  constructor(@InjectDataSource() public dataSource: DataSource) {}
  async createLikeForPost(
    userId: string,
    login: string,
    postId: string,
    status: LikeDislikeStatus,
  ): Promise<number> {
    const createdLikeForPostId: InsertReturningType[] =
      await this.dataSource.query(
        `INSERT INTO "LikesForPosts" ("userId", "login", "postId", "status", "createdAt")
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id`,
        [userId, login, postId, status],
      );
    return createdLikeForPostId[0].id;
  }

  async updateLikeForPost(
    userId: string,
    postId: string,
    likeStatus: LikeDislikeStatus,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "LikesForPosts"
      SET "status" = $1
      WHERE "postId" = $2 AND "userId" = $3`,
      [likeStatus, postId, userId],
    );
    return;
  }

  async findLikeByUserIdAndPostId(
    userId: string,
    postId: string,
  ): Promise<LikeEntityForPostType[]> {
    return await this.dataSource.query(
      `SELECT *
    FROM "LikesForPosts"
    WHERE "postId"= $1 AND "userId" = $2 `,
      [postId, userId],
    );
  }
}
