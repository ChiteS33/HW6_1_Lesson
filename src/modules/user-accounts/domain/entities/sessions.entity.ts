import { Payload } from '../../../../core/types/payload.type';
import { Column, Entity } from 'typeorm';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';

@Entity({ name: 'Sessions' })
export class Session extends BaseDbEntity {
  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  deviceId: number;

  @Column({ type: 'varchar' })
  deviceName: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'timestamp with time zone' })
  iat: Date;

  @Column({ type: 'timestamp with time zone' })
  exp: Date;

  public static createSession(
    payload: Payload,
    sessionIp: string,
    deviceName: string,
  ) {
    const newSession = new Session();

    newSession.userId = Number(payload.userId);
    newSession.deviceId = Number(payload.deviceId);
    newSession.deviceName = deviceName;
    newSession.ip = sessionIp;
    newSession.iat = new Date(payload.iat * 1000);
    newSession.exp = new Date(payload.exp * 1000);
    return newSession;
  }

  updateSession(newIat: Date, newExp: Date) {
    this.iat = newIat;
    this.exp = newExp;
    return;
  }
}
