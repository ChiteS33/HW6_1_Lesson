import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  LikeEntityForCommentType,
  LikeEntityForCommentWithLikeStatusType,
} from '../entity-types/likeEntityForComment.type';
import { LikeDislikeStatus } from '../../domain/entities/posts.entity';

@Injectable()
export class LikesForCommentRepository {
  constructor(@InjectDataSource() public dataSource: DataSource) {}
  async createLike(
    userId: string,
    login: string,
    commentId: string,
    status: LikeDislikeStatus,
  ): Promise<LikeEntityForCommentType> {
    const createdLikeId: LikeEntityForCommentType[] =
      await this.dataSource.query(
        `INSERT INTO "LikesForComments" ("userId", "login", "commentId","status", "createdAt" ) 
    VALUES ($1, $2, $3, $4, NOW())`,
        [userId, login, commentId, status],
      );
    return createdLikeId[0] ?? null;
  }

  async updateLikeForComment(
    commentId: string,
    likeStatus: LikeDislikeStatus,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "LikesForComments"
      SET "status" = $1
      WHERE "commentId" = $2`,
      [likeStatus, commentId],
    );
    return;
  }

  async findLikeByUserIdAndCommentId(
    userId: string,
    commentId: string,
  ): Promise<LikeEntityForCommentType> {
    const foundLike: LikeEntityForCommentWithLikeStatusType[] =
      await this.dataSource.query(
        `SELECT *
      FROM "LikesForComments" 
      WHERE "userId" = $1 AND "commentId" = $2 `,
        [userId, commentId],
      );
    return foundLike[0];
  }

  async deleteLikesForComment(commentId: string): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM "LikesForComments"
    WHERE "commentId" = $1 `,
      [commentId],
    );
    return;
  }
}
