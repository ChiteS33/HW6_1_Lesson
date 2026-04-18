import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../domain/entities/blogs.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
  ) {}

  async save(blog: Blog): Promise<string> {
    const createdBlog = await this.blogsRepository.save(blog);
    return createdBlog.id.toString();
  }

  async findBlogByBlogId(blogId: number): Promise<Blog | null> {
    const foundBlog = await this.blogsRepository.findOne({
      where: { id: blogId },
    });
    return foundBlog ?? null;
  }

  async deleteBlogById(blogId: number): Promise<void> {
    await this.blogsRepository.softDelete(blogId);
  }
}
