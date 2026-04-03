import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../../domain/entities/sessions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}

  async getAllSessionsForUser(userId: number): Promise<Session[] | null> {
    // const foundSession: Session[] | null = await this.sessionRepository
    //   .createQueryBuilder('sessions')
    //   .select('*')
    //   .where('sessions.userId = :userId', { userId })
    //   .getMany();
    // return foundSession ?? null;

    const foundSessionsKekw = await this.sessionRepository.find({
      where: { userId: userId },
    });
    return foundSessionsKekw ?? null;
  }
}
