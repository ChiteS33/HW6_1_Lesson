import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogInputDto } from '../../domain/entities/blogs.entity';
import { InsertReturningType } from '../../../../core/types/id.type';
import { BlogEntityType } from '../entity-types/blogEntity.type';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async createBlog(blog: BlogInputDto): Promise<string> {
    const createdBlogId: InsertReturningType[] = await this.datasource.query(
      `INSERT INTO "Blogs" ("name", "description", "websiteUrl", "createdAt") 
    VALUES ($1, $2, $3, NOW()) RETURNING "id"`,
      [blog.name, blog.description, blog.websiteUrl],
    );

    return createdBlogId[0].id.toString();
  }

  async findBlogByBlogId(blogId: string): Promise<BlogEntityType | null> {
    const foundBlog: BlogEntityType[] = await this.datasource.query(
      `SELECT * FROM "Blogs" 
         WHERE "id" = $1`,
      [blogId],
    );
    return foundBlog[0] ?? null;
  }

  async updateBlog(blogInputDto: BlogInputDto, blogId: string): Promise<void> {
    await this.datasource.query(
      `UPDATE "Blogs"
      SET "name" = $1,
          "description" = $2,
          "websiteUrl" = $3
      WHERE "id" = $4`,
      [
        blogInputDto.name,
        blogInputDto.description,
        blogInputDto.websiteUrl,
        blogId,
      ],
    );
    return;
  }

  async deleteBlogById(blogId: string): Promise<void> {
    await this.datasource.query(`DELETE FROM "Blogs" WHERE "id" = $1`, [
      blogId,
    ]);
    return;
  }
}
