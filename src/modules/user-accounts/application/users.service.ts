import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../repositories/userRepositories/users.repository';
import { User } from '../domain/entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  async findUserById(userId: string): Promise<User> {
    const foundedUser: User | null = await this.usersRepository.findUserById(
      Number(userId),
    );
    if (!foundedUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'userId',
        message: 'User not found',
      });
    }
    return foundedUser;
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User> {
    const foundedUser: User | null =
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
