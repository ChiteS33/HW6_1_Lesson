import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../repositories/userRepositories/users.repository';
import { UserEntityType } from '../repositories/entity-types/user/userEntity.type';

@Injectable()
export class UsersService {
  constructor(
    // @InjectModel(UserModel.name)
    // private userModel: UserModelI,
    @Inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  async findUserById(userId: string): Promise<UserEntityType> {
    const foundedUser: UserEntityType | null =
      await this.usersRepository.findUserById(userId);
    if (!foundedUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'userId',
        message: 'User not found',
      });
    }
    return foundedUser;
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntityType> {
    const foundedUser: UserEntityType | null =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
    if (!foundedUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        field: 'loginOrEmail',
        message: 'User not found',
      });
    }
    return foundedUser;
  }

  async findUserByLogin(login: string): Promise<void> {
    const foundedUser =
      await this.usersRepository.findUserByLoginOrEmail(login);
    if (foundedUser)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already exists',
        field: 'login',
      });
    return;
  }

  async findUserByEmail(email: string): Promise<void> {
    const foundedUser =
      await this.usersRepository.findUserByLoginOrEmail(email);
    if (foundedUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'email',
        message: 'User already exists',
      });
    }
  }
}
