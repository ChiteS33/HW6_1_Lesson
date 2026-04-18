import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { settings } from '../constants';
import { UsersRepository } from '../../repositories/userRepositories/users.repository';
import { User } from '../../domain/entities/users.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: settings.JWT_SECRET,
    });
  }

  async validate(payload: {
    userId: string;
    iat: number;
    exp: number;
  }): Promise<User | null> {
    if (!payload) {
      return null;
    }
    const foundedUser: User | null = await this.usersRepository.findUserById(
      payload.userId,
    );
    if (!foundedUser) {
      return null;
    }

    return foundedUser;
  }
}
