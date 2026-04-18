import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationForRepoWithSearchName } from '../../../../core/types/paginationDtoWithSearchNameForRepo.type';
import { Blog } from '../../domain/entities/blogs.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog) private blogRepository: Repository<Blog>,
  ) {}

  async getAllBlogs(
    query: PaginationForRepoWithSearchName,
  ): Promise<{ foundBlogs: Blog[]; totalCount: number }> {
    const skip = (query.pageNumber - 1) * query.pageSize;
    const limit = query.pageSize;
    const allowedSortFields = [
      'id',
      'name',
      'description',
      'websiteUrl',
      'createdAt',
      'isMembership',
    ];
    const safeSortBy = allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .select([
        'blog.id',
        'blog.name',
        'blog.description',
        'blog.websiteUrl',
        'blog.createdAt',
        'blog.isMembership',
      ])
      .where('blog.name ILIKE :nameTerm', {
        nameTerm: `%${query.searchNameTerm}%`,
      })
      .orderBy(`blog.${safeSortBy}`, sortDirection)
      .skip(skip)
      .take(limit);
    const foundBlogs = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();
    return { foundBlogs, totalCount };
  }
}
