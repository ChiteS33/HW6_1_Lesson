import { SessionViewType } from '../../api/view-types/sessions/sessionView.type';
import { Session } from '../../domain/entities/sessions.entity';

export const sessionViewMapper = (dto: Session): SessionViewType => {
  return {
    ip: dto.id.toString(),
    title: dto.deviceName,
    lastActiveDate: dto.iat.toISOString(),
    deviceId: dto.deviceId.toString(),
  };
};
