import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { settings } from '../../../guards/constants';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Payload } from '../../../../../core/types/payload.type';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAdapter {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  createJWT(userId: string): string {
    // const ACCESS_TOKEN_SECRET = this.configService.get<string>(
    //   'ACCESS_TOKEN_SECRET',
    //   'SECRET',
    // );
    // const ACCESS_TOKEN_EXPIRES_IN = this.configService.get<string>(
    //   'ACCESS_TOKEN_EXPIRES_IN',
    //   '5',
    // );

    // const accesToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    //   expiresIn: `${+ACCESS_TOKEN_EXPIRES_IN}`,
    // });

    return jwt.sign({ userId }, settings.JWT_SECRET, {
      expiresIn: '10m',
    });
  }

  createRefreshToken(
    userId: string,
    deviceId: string = Math.floor(Math.random() * 1000000000).toString(),
  ): string {
    const payload = { userId: userId, deviceId: deviceId };
    return jwt.sign(payload, settings.JWT_REFRESH_TOKEN, { expiresIn: '20m' });
  }

  verifyRefreshToken(token: string): Payload {
    if (!token) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        field: 'Refresh token',
        message: 'Refresh token not found',
      });
    }

    return jwt.verify(token, settings.JWT_REFRESH_TOKEN) as Payload;
  }

  decodeJWT(token: string): Payload {
    return jwtDecode(token);
  }
}
