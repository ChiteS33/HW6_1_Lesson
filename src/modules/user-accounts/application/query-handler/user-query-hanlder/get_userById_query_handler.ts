import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UsersRepository } from '../../../repositories/userRepositories/users.repository';
import { userViewMapper } from '../../../mappers/user/userViewMapper';
import { User } from '../../../domain/entities/users.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetUserByIdQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(UsersRepository) private userRepository: UsersRepository,
  ) {}
  async execute(query: GetUserByIdQuery): Promise<any> {
    const foundUser = await this.findUserById(query.userId);
    return userViewMapper(foundUser);
  }
  private async findUserById(userId: string): Promise<User> {
    const foundUser = await this.userRepository.findUserById(Number(userId));
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'userId',
        message: 'User not found',
      });
    }
    return foundUser;
  }
}
