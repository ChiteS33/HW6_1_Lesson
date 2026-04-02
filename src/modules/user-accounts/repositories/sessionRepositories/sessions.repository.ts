import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InsertReturningType } from '../../../../core/types/id.type';
import { Payload } from '../../../../core/types/payload.type';
import { sessionViewMapper } from '../../mappers/session/sessionViewMapper';
import { SessionEntityType } from '../entity-types/session/sessionEntity.type';
import { SessionViewType } from '../../api/view-types/sessions/sessionView.type';

@Injectable()
export class SessionsRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}
  async createSession(
    payload: Payload,
    sessionIp: string,
    deviceName: string,
  ): Promise<number> {
    const createdSessionId: InsertReturningType = await this.datasource.query(
      `INSERT INTO "Sessions" ("deviceId", "deviceName", "ip","userId", "exp", "iat")
    VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        payload.deviceId,
        deviceName,
        sessionIp,
        payload.userId,
        new Date(payload.exp * 1000).toISOString(),
        new Date(payload.iat * 1000).toISOString(),
      ],
    );

    return createdSessionId.id;
  }

  async findAllSessions(userId: string): Promise<SessionViewType[]> {
    const foundSessions: SessionEntityType[] = await this.datasource.query(
      `SELECT *
    FROM "Sessions" 
    WHERE "userId" = $1`,
      [userId],
    );
    return foundSessions.map(sessionViewMapper);
  }

  async deleteAlmostAll(userId: string, deviceId: string): Promise<void> {
    await this.datasource.query(
      `DELETE FROM "Sessions"
     WHERE "userId" = $1
       AND "deviceId" <> $2`,
      [userId, deviceId],
    );
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<SessionEntityType | null> {
    const foundSession: SessionEntityType[] = await this.datasource.query(
      `SELECT * FROM "Sessions" WHERE "deviceId" = $1`,
      [deviceId],
    );
    return foundSession.length === 0 ? null : foundSession[0];
  }

  async deleteSessionByDeviceId(deviceId: string): Promise<void> {
    await this.datasource.query(
      `DELETE FROM "Sessions" WHERE "deviceId" = $1`,
      [deviceId],
    );
    return;
  }

  async findSessionByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<SessionEntityType | null> {
    const foundSession: SessionEntityType[] = await this.datasource.query(
      `SELECT *
      FROM "Sessions"
    WHERE "deviceId" = $1 and "userId" = $2`,
      [deviceId, userId],
    );
    return foundSession.length === 0 ? null : foundSession[0];
  }

  async updateSession(
    sessionId: number,
    iat: string,
    exp: string,
  ): Promise<void> {
    await this.datasource.query(
      `UPDATE "Sessions" SET "iat" = $1, "exp" = $2
    WHERE id = $3`,
      [iat, exp, sessionId],
    );

    return;
  }
}
