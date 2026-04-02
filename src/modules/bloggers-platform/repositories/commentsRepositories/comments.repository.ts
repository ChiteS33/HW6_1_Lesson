import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InsertReturningType } from '../../../../core/types/id.type';
import { CommentEntityType } from '../../../user-accounts/repositories/entity-types/comment/commentEntity.type';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createComment(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<string> {
    const createdCommentId: InsertReturningType[] = await this.dataSource.query(
      `INSERT INTO "Comments" ("content", "postId", "userId", "userLogin", "createdAt") 
    VALUES ($1, $2, $3, $4,NOW())
    RETURNING "id"`,
      [content, postId, userId, userLogin],
    );
    return createdCommentId[0].id.toString();
  }

  async findCommentById(commentId: string): Promise<CommentEntityType> {
    const foundComment: CommentEntityType[] = await this.dataSource.query(
      `SELECT *
    FROM "Comments"
    WHERE "id" = $1`,
      [commentId],
    );
    return foundComment[0];
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE "Comments"
    SET "content" = $1
    WHERE "id" = $2`,
      [content, +commentId],
    );
    return;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM "Comments"
       WHERE "id" = $1`,
      [commentId],
    );
    return;
  }
}
