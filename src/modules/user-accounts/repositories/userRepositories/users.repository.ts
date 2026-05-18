import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntityType } from '../entity-types/user/userEntity.type';
import { User } from '../../domain/entities/users.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private datasource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async save(user: User): Promise<string> {
    const savedUser = await this.userRepository.save(user);
    return savedUser.id.toString();
  }

  async findUserById(userId: number): Promise<User | null> {
    const foundUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    return foundUser ?? null;
  }

  async deleteUserById(userId: number): Promise<void> {
    await this.userRepository.softDelete(userId);
    return;
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const foundUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.login = :loginOrEmail', { loginOrEmail })
      .orWhere('user.email = :loginOrEmail', { loginOrEmail })
      .getOne();

    return foundUser ?? null;
  }

  async findUserByConfirmationCode(code: string): Promise<User | null> {
    const foundUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.confirmationCode = :code', { code })
      .getOne();

    return foundUser ?? null;
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<User | null> {
    const foundUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.recoveryCode = :recoveryCode', { recoveryCode })
      .getOne();

    return foundUser ?? null;
  }

  async findUserByEmail(email: string): Promise<UserEntityType | null> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      'SELECT * FROM "Users" WHERE "email" = $1',
      [email],
    );
    return foundUser[0] ?? null;
  }

  async findUserByLogin(login: string): Promise<UserEntityType | null> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      'SELECT * FROM "Users" WHERE "login" = $1',
      [login],
    );
    return foundUser[0] ?? null;
  }
}
