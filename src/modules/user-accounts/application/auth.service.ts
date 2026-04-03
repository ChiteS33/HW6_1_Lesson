import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { BcryptAdapter } from './adapters/bcryptAdapter/bcrypt.adapter';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { inputValidationLoginOrEmailAndPass } from '../validation/inputValidationLoginOrEmailAndPass.validation';
import { User } from '../domain/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(BcryptAdapter) private readonly bcryptService: BcryptAdapter,
  ) {}

  async checkingUser(body: inputValidationLoginOrEmailAndPass): Promise<User> {
    const foundUser: User = await this.usersService.findUserByLoginOrEmail(
      body.loginOrEmail,
    );
    const isValid = await this.bcryptService.compare(
      body.password,
      foundUser.passwordHash,
    );
    if (!isValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        field: 'Password',
        message: 'Invalid password',
      });
    }
    return foundUser;
  }
}
