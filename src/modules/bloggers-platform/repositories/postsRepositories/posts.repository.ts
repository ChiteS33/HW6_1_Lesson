import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  PostInputDtoValidation,
  PostInputDtoValidationForCreate,
} from '../../domain/entities/posts.entity';
import { InsertReturningType } from '../../../../core/types/id.type';
import { PostEntityWithLikeCounterType } from '../entity-types/postEntity.type';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  // async save(post: PostDocument | PostModel): Promise<string> {
  //   const dataAboutPostBlog = await this.postModel.create(post);
  //   await dataAboutPostBlog.save();
  //   return dataAboutPostBlog._id.toString();
  // }
  async createPost(
    blogId: string,
    blogName: string,
    postInputDto: PostInputDtoValidation | PostInputDtoValidationForCreate,
  ): Promise<string> {
    const createdPostId: InsertReturningType[] = await this.datasource.query(
      `INSERT INTO "Posts" ("title", "shortDescription", "content", "blogId", "blogName", "createdAt")
VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING "id"`,
      [
        postInputDto.title,
        postInputDto.shortDescription,
        postInputDto.content,
        blogId,
        blogName,
      ],
    );
    return createdPostId[0].id.toString();
  }

  async findPostsById(postId: string): Promise<PostEntityWithLikeCounterType> {
    const foundPost: PostEntityWithLikeCounterType[] =
      await this.datasource.query(
        `SELECT * 
    FROM "Posts" 
    WHERE "id" = $1`,
        [postId],
      );
    return foundPost[0];
  }

  async deletePostById(postId: string): Promise<void> {
    await this.datasource.query(`DELETE FROM "Posts" WHERE "id" = $1`, [
      postId,
    ]);
    return;
  }

  async updatePost(
    blogId: string,
    postId: string,
    postInputDto: PostInputDtoValidation,
  ): Promise<void> {
    await this.datasource.query(
      `UPDATE "Posts" 
    SET "title" = $1,
        "shortDescription" = $2,
        "content" = $3
    WHERE "id" = $4`,
      [
        postInputDto.title,
        postInputDto.shortDescription,
        postInputDto.content,
        postId,
      ],
    );
    return;
  }
}
