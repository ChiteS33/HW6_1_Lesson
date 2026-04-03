import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Session } from '../../domain/entities/sessions.entity';
import { log } from 'node:util';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectDataSource() private datasource: DataSource,
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}

  async save(session: Session): Promise<string> {
    const savedSession = await this.sessionRepository.save(session);
    return savedSession.id.toString();
  }

  async deleteAlmostAll(userId: number, deviceId: number): Promise<void> {
    await this.sessionRepository.softDelete({
      userId: userId,
      deviceId: Not(deviceId),
    });
    return;
  }

  async findSessionByDeviceId(deviceId: string): Promise<Session | null> {
    const foundSession = await this.sessionRepository.findOne({
      where: { deviceId: Number(deviceId) },
    });
    return foundSession ?? null;
  }

  async deleteSessionByDeviceId(deviceId: number): Promise<void> {
    await this.sessionRepository.softDelete({ deviceId: deviceId });
    return;
  }

  async findSessionByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<Session | null> {
    const foundSession = await this.sessionRepository.findOne({
      where: { deviceId: Number(deviceId), userId: Number(userId) },
    });
    return foundSession ?? null;
  }
}
