import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationWithSearchLoginTermAndSearchEMailTermForRepo } from '../../../../core/types/PaginationWithSearchLoginTermAndSearchEMailTermForRepo.type';
import { User } from '../../domain/entities/users.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() private datasource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllUsers(
    query: PaginationWithSearchLoginTermAndSearchEMailTermForRepo,
  ): Promise<{ foundUsers: User[]; totalCount: number }> {
    const skip = (query.pageNumber - 1) * query.pageSize;
    const limit = query.pageSize;
    const allowedSortFields = ['login', 'createdAt', 'email', 'id'];
    const safeSortBy = allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.login', 'user.email', 'user.createdAt'])
      .where('user.login ILIKE :loginTerm', {
        loginTerm: `%${query.searchLoginTerm}%`,
      })
      .orWhere('user.email ILIKE :emailTerm', {
        emailTerm: `%${query.searchEmailTerm}%`,
      })
      .orderBy(`user.${safeSortBy}`, sortDirection)
      .skip(skip)
      .take(limit);
    const foundUsers = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

    return { foundUsers, totalCount };
  }

  async findUserByUserId(userId: number): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id= :userId', { userId })
      .getOne();
  }
}
