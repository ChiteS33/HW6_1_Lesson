import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OptionalBearerGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any | false, info: any) {
    return user || null;
  }
}
