import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtAdapter } from '../../adapters/jwtAdapter/jwt-adapter.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Payload } from '../../../../../core/types/payload.type';
import { PairTokens } from '../../../../../core/types/pairTokens.type';
import { SessionsRepository } from '../../../repositories/sessionRepositories/sessions.repository';
import { SessionEntityType } from '../../../repositories/entity-types/session/sessionEntity.type';

export class RefreshTokensCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase implements ICommandHandler<RefreshTokensCommand> {
  constructor(
    @Inject(JwtAdapter) private jwtAdapter: JwtAdapter,
    @Inject(SessionsRepository) private sessionsRepository: SessionsRepository,
  ) {}
  async execute(command: RefreshTokensCommand): Promise<PairTokens> {
    const payloadRefreshToken: Payload = this.jwtAdapter.decodeJWT(
      command.refreshToken,
    );
    const accessToken = this.jwtAdapter.createJWT(payloadRefreshToken.userId);
    const refreshToken = this.jwtAdapter.createRefreshToken(
      payloadRefreshToken.userId,
      payloadRefreshToken.deviceId,
    );
    const newPayload = this.jwtAdapter.decodeJWT(refreshToken);
    const newIat = new Date(newPayload.iat * 1000).toISOString();
    const newExp = new Date(newPayload.exp * 1000).toISOString();
    const foundSession: SessionEntityType | null =
      await this.sessionsRepository.findSessionByDeviceId(
        payloadRefreshToken.deviceId,
      );
    if (!foundSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'refreshToken',
        message: 'Session not found',
      });
    }

    await this.sessionsRepository.updateSession(
      foundSession.id,
      newIat,
      newExp,
    );
    return { accessToken, refreshToken };
  }
}
