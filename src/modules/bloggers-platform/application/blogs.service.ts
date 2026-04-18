import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogsRepositories/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}
}
