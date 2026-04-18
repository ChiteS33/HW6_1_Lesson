import { Injectable } from '@nestjs/common';
import { paginationValuesForRepo } from '../../../../core/mappers/paginationValuesMakerMapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../../domain/entities/comments.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  async findAllCommentsByPostId(
    postId: number,
    paginationValues: paginationValuesForRepo,
  ): Promise<{ foundComments: Comment[]; totalCount: number }> {
    const skip = (paginationValues.pageNumber - 1) * paginationValues.pageSize;
    const limit = paginationValues.pageSize;
    const allowedSortFields = [
      'id',
      'content',
      'postId',
      'userId',
      'userLogin',
      'createdAt',
    ];

    const safeSortBy = allowedSortFields.includes(paginationValues.sortBy)
      ? paginationValues.sortBy
      : 'createdAt';
    const sortDirection =
      paginationValues.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .select([
        'comment.id as "id"',
        'comment.content as "content"',
        'comment.userId as "userId"',
        'comment.userLogin as "userLogin"',
        'comment.createdAt as "createdAt"',
      ])
      .where('comment.postId = :postId', { postId })
      .orderBy(`comment.${safeSortBy}`, sortDirection)
      .offset(skip)
      .limit(limit);

    const countBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.deletedAt IS NULL');

    const foundComments: Comment[] = await queryBuilder.getRawMany();
    const totalCount: number = await countBuilder.getCount();

    return { foundComments, totalCount };
  }
}
