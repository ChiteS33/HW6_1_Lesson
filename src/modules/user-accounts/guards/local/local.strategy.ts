import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../application/auth.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { User } from '../../domain/entities/users.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<User> {
    const user = await this.authService.checkingUser({
      loginOrEmail,
      password,
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        field: 'loginOrEmail or password',
        message: 'Invalid loginOrEmail or password',
      });
    }
    return user;
  }
}
