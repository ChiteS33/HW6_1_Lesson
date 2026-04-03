import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtAdapter } from '../../adapters/jwtAdapter/jwt-adapter.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { SessionsRepository } from '../../../repositories/sessionRepositories/sessions.repository';
import { Payload } from '../../../../../core/types/payload.type';
import { Session } from '../../../domain/entities/sessions.entity';

export class LogoutCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(JwtAdapter) private readonly jwtAdapter: JwtAdapter,
    @Inject(SessionsRepository)
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    this.jwtAdapter.verifyRefreshToken(command.refreshToken);
    const payloadRefreshToken: Payload = this.jwtAdapter.decodeJWT(
      command.refreshToken,
    );
    const foundSession: Session | null =
      await this.sessionsRepository.findSessionByUserIdAndDeviceId(
        payloadRefreshToken.userId,
        payloadRefreshToken.deviceId,
      );

    if (!foundSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'refreshToken',
        message: 'Sessions not found',
      });
    }
    await this.sessionsRepository.deleteSessionByDeviceId(
      +foundSession.deviceId,
    );
    return;
  }
}
