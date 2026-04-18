import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostWithBlogName } from '../../domain/entities/posts.entity';
import { paginationValuesForRepo } from '../../../../core/mappers/paginationValuesMakerMapper';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async findAllPosts(paginationValues: paginationValuesForRepo): Promise<{
    foundPosts: PostWithBlogName[];
    totalCount: number;
  }> {
    const skip = (paginationValues.pageNumber - 1) * paginationValues.pageSize;
    const limit = paginationValues.pageSize;
    const allowedSortFields = [
      'id',
      'title',
      'shortDescription',
      'content',
      'blogId',
      'createdAt',
      'blogName',
    ];

    const safeSortBy = allowedSortFields.includes(paginationValues.sortBy)
      ? paginationValues.sortBy
      : 'createdAt';
    const sortDirection =
      paginationValues.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.id as "id"',
        'post.title as "title"',
        'post.shortDescription as "shortDescription"',
        'post.content as "content"',
        'post.blogId as "blogId"',
        'post.createdAt as "createdAt"',
        'blog.name as "blogName"',
      ])
      .leftJoin('Blog', 'blog', 'blog.id = post.blogId')
      .orderBy(
        safeSortBy === 'blogName' ? 'blog.name' : `post.${safeSortBy}`,
        sortDirection,
      )
      .offset(skip)
      .limit(limit);

    const countBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.deletedAt IS NULL');

    const foundPosts: PostWithBlogName[] = await queryBuilder.getRawMany();
    const totalCount: number = await countBuilder.getCount();

    return { foundPosts, totalCount };
  }

  async findAllPostsByBlogId(
    blogId: number,
    paginationValues: paginationValuesForRepo,
  ): Promise<{
    foundPosts: PostWithBlogName[];
    totalCount: number;
  }> {
    const skip = (paginationValues.pageNumber - 1) * paginationValues.pageSize;
    const limit = paginationValues.pageSize;
    const allowedSortFields = [
      'id',
      'title',
      'shortDescription',
      'content',
      'blogId',
      'createdAt',
      'blogName',
    ];
    const safeSortBy = allowedSortFields.includes(paginationValues.sortBy)
      ? paginationValues.sortBy
      : 'createdAt';
    const sortDirection =
      paginationValues.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.id as "id"',
        'post.title as "title"',
        'post.shortDescription as "shortDescription" ',
        'post.content as "content" ',
        'post.blogId as "blogId" ',
        'post.createdAt as "createdAt"',
        'blog.name as "blogName"',
      ])
      .leftJoin('Blog', 'blog', 'blog.id = post.blogId')
      .where(`post.blogId = :blogId`, { blogId: blogId })
      .orderBy(`post.${safeSortBy}`, sortDirection)
      .offset(skip)
      .limit(limit);

    const countBuilder = this.postRepository
      .createQueryBuilder('post')
      .where(`post.blogId = :blogId`, { blogId: blogId });

    const foundPosts: PostWithBlogName[] = await queryBuilder.getRawMany();
    const totalCount: number = await countBuilder.getCount();

    return { foundPosts, totalCount };
  }
}
