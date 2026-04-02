import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptAdapter {
  constructor() {}

  async hashMake(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, foundedHash: string): Promise<boolean> {
    return bcrypt.compare(password, foundedHash);
  }
}
