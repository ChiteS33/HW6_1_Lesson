import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationWithSearchLoginTermAndSearchEMailTermForRepo } from '../../../../core/types/PaginationWithSearchLoginTermAndSearchEMailTermForRepo.type';
import { userViewMapper } from '../../mappers/user/userViewMapper';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { UserEntityType } from '../entity-types/user/userEntity.type';
import { UserViewType } from '../../api/view-types/user/userView.type';
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

  async findUserByUserId(userId: string): Promise<UserViewType> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      `SELECT "id", "login", "email", "createdAt"
      FROM "Users" WHERE id = $1`,
      [userId],
    );
    if (!foundUser[0]) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'userId',
        message: 'User not found',
      });
    }
    return userViewMapper(foundUser[0]);
  }
}
