import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Payload } from '../../../../core/types/payload.type';

// @Schema({ versionKey: false })
// export class SessionsModel {
//   constructor() {}
//   @Prop({ type: String, required: true }) userId: string;
//   @Prop({ type: String, required: true }) deviceId: string;
//   @Prop({ type: String, required: true }) iat: string;
//   @Prop({ type: String, required: true }) deviceName: string;
//   @Prop({ type: String, required: true }) ip: string;
//   @Prop({ type: String, required: true }) exp: string;
//
//   public static createSession(
//     payload: Payload,
//     sessionIp: string,
//     deviceName: string,
//   ): SessionsModel {
//     const newSession = new SessionsModel();
//     newSession.userId = payload.userId;
//     newSession.deviceId = payload.deviceId;
//     newSession.iat = new Date(payload.iat * 1000).toISOString();
//     newSession.deviceName = deviceName;
//     newSession.ip = sessionIp;
//     newSession.exp = new Date(payload.exp * 1000).toISOString();
//     return newSession;
//   }
//
//   updateSession(newIat: number, newExp: number): void {
//     this.iat = new Date(newIat * 1000).toISOString();
//     this.exp = new Date(newExp * 1000).toISOString();
//     return;
//   }
// }
//
// export type SessionsDocument = HydratedDocument<SessionsModel>;
//
// export const SessionSchema = SchemaFactory.createForClass(SessionsModel);
// SessionSchema.loadClass(SessionsModel);
// export interface SessionModelI extends Model<SessionsModel> {
//   createSession(
//     payload: any,
//     sessionIp: string,
//     deviceName: string,
//   ): SessionsModel;
// }
