import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtAdapter } from '../../adapters/jwtAdapter/jwt-adapter.service';
import { SessionsService } from '../../sessions.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { SessionsRepository } from '../../../repositories/sessionRepositories/sessions.repository';
import { SessionEntityType } from '../../../repositories/entity-types/session/sessionEntity.type';

export class DeleteSessionByDeviceIdCommand {
  constructor(
    public deviceId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase implements ICommandHandler<DeleteSessionByDeviceIdCommand> {
  constructor(
    @Inject(JwtAdapter) private jwtAdapter: JwtAdapter,
    @Inject(SessionsService) private sessionService: SessionsService,
    @Inject(SessionsRepository) private sessionsRepository: SessionsRepository,
  ) {}

  async execute(command: DeleteSessionByDeviceIdCommand): Promise<void> {
    const payloadRefreshToken = this.jwtAdapter.decodeJWT(command.refreshToken);

    const foundSession: SessionEntityType =
      await this.sessionService.findSessionByDeviceId(command.deviceId);

    if (!foundSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'DeviceId',
        message: 'Session not found.',
      });
    }
    if (foundSession.userId.toString() !== payloadRefreshToken.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'refreshToken',
        message: 'User hasn`t rigths',
      });
    }

    await this.sessionsRepository.deleteSessionByDeviceId(command.deviceId);
    return;
  }
}
