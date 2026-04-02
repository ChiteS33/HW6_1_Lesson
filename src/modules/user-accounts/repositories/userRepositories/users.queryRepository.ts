import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InPutPaginationWithSearchLoginTermAndSearchEMailTerm } from '../../../../core/types/inputPaginationDtoWithSearchTerms.type';
import { PaginationWithSearchLoginTermAndSearchEMailTermForRepo } from '../../../../core/types/PaginationWithSearchLoginTermAndSearchEMailTermForRepo.type';
import { paginationValuesMakerWithSearchLoginAndEmailMapper } from '../../../../core/mappers/paginationValuesMakerWithSearchLoginAndEmailMapper';
import { TotalCount } from '../../../../core/types/totalCount.type';
import { userViewMapper } from '../../mappers/user/userViewMapper';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { userViewMapperWithPagination } from '../../mappers/user/userViewMapperWithPagination';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { PaginationViewType } from '../../../../core/types/paginationViewType';
import { FinalViewWithPaginationType } from '../../../../core/types/finalViewWithPagination.type';
import { UserEntityType } from '../entity-types/user/userEntity.type';
import { UserViewType } from '../../api/view-types/user/userView.type';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async getAllUsers(
    query: InPutPaginationWithSearchLoginTermAndSearchEMailTerm,
  ): Promise<FinalViewWithPaginationType<UserViewType>> {
    const pagination: PaginationWithSearchLoginTermAndSearchEMailTermForRepo =
      paginationValuesMakerWithSearchLoginAndEmailMapper(query);
    const skip = (pagination.pageNumber - 1) * pagination.pageSize;
    const limit = pagination.pageSize;
    const allowedSortFields = ['login', 'createdAt', 'email', 'id'];
    const allowedDirections = ['ASC', 'DESC'];
    const safeSortBy = allowedSortFields.includes(pagination.sortBy)
      ? pagination.sortBy
      : 'createdAt';
    const safeSortDirection = allowedDirections.includes(
      pagination.sortDirection.toUpperCase(),
    )
      ? pagination.sortDirection.toUpperCase()
      : 'DESC';

    const foundedUsers: UserEntityType[] = await this.datasource.query(
      `SELECT "id", "login", "email", "createdAt"
    FROM "Users"
    WHERE "login" ILIKE $1 OR "email" ILIKE $2
    ORDER BY "${safeSortBy}" ${safeSortDirection}
    LIMIT $4 OFFSET $3`,
      [
        `%${pagination.searchLoginTerm}%`,
        `%${pagination.searchEmailTerm}%`,
        skip,
        limit,
      ],
    );

    const totalCount: TotalCount[] = await this.datasource.query(
      `SELECT COUNT(*) :: int as count 
    FROM "Users"
       WHERE "login" ILIKE $1 OR "email" ILIKE $2`,
      [`%${pagination.searchLoginTerm}%`, `%${pagination.searchEmailTerm}%`],
    );
    const mappedUsers: UserViewType[] = foundedUsers.map(userViewMapper);
    const params: PaginationViewType = {
      pagesCount: Math.ceil(totalCount[0].count / limit),
      page: pagination.pageNumber,
      pageSize: limit,
      totalCount: totalCount[0].count,
    };
    return userViewMapperWithPagination(mappedUsers, params);
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
