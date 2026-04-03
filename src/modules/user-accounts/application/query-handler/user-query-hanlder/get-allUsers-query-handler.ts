import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinalViewWithPaginationType } from '../../../../../core/types/finalViewWithPagination.type';
import { UserViewType } from '../../../api/view-types/user/userView.type';
import { Inject } from '@nestjs/common';
import { UsersQueryRepository } from '../../../repositories/userRepositories/users.queryRepository';
import { InPutPaginationWithSearchLoginTermAndSearchEMailTerm } from '../../../../../core/types/inputPaginationDtoWithSearchTerms.type';
import { PaginationWithSearchLoginTermAndSearchEMailTermForRepo } from '../../../../../core/types/PaginationWithSearchLoginTermAndSearchEMailTermForRepo.type';
import { paginationValuesMakerWithSearchLoginAndEmailMapper } from '../../../../../core/mappers/paginationValuesMakerWithSearchLoginAndEmailMapper';
import { userViewMapperWithPagination } from '../../../mappers/user/userViewMapperWithPagination';
import { PaginationViewType } from '../../../../../core/types/paginationViewType';
import { userViewMapper } from '../../../mappers/user/userViewMapper';
import { User } from '../../../domain/entities/users.entity';

export class GetAllUsersQuery {
  constructor(
    public query: InPutPaginationWithSearchLoginTermAndSearchEMailTerm,
  ) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(
    @Inject(UsersQueryRepository)
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    query: GetAllUsersQuery,
  ): Promise<FinalViewWithPaginationType<UserViewType>> {
    const pagination: PaginationWithSearchLoginTermAndSearchEMailTermForRepo =
      paginationValuesMakerWithSearchLoginAndEmailMapper(query.query);

    const foundUsers: {
      foundedUsers: User[];
      totalCount: number;
    } = await this.usersQueryRepository.getAllUsers(pagination);
    const params: PaginationViewType = {
      pagesCount: Math.ceil(foundUsers.totalCount / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: foundUsers.totalCount,
    };
    const mappedUsers: UserViewType[] =
      foundUsers.foundedUsers.map(userViewMapper);

    return userViewMapperWithPagination(mappedUsers, params);
  }
}
