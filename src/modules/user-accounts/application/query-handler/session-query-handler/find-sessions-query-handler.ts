import { CommandHandler, ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtAdapter } from '../../adapters/jwtAdapter/jwt-adapter.service';
import { Payload } from '../../../../../core/types/payload.type';
import { SessionsRepository } from '../../../repositories/sessionRepositories/sessions.repository';
import { SessionViewType } from '../../../api/view-types/sessions/sessionView.type';
import { sessionViewMapper } from '../../../mappers/session/sessionViewMapper';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { SessionsQueryRepository } from '../../../repositories/sessionRepositories/sessions.queryRepository';

export class FindAllSessionsQuery {
  constructor(public refreshToken: string) {}
}

@QueryHandler(FindAllSessionsQuery)
export class FindAllSessionsQueryHandler implements ICommandHandler<FindAllSessionsQuery> {
  constructor(
    @Inject(SessionsRepository) private sessionsRepository: SessionsRepository,
    @Inject(JwtAdapter) private jwtAdapter: JwtAdapter,
    @Inject(SessionsQueryRepository)
    private sessionsQueryRepository: SessionsQueryRepository,
  ) {}

  async execute(command: FindAllSessionsQuery): Promise<SessionViewType[]> {
    const payloadRefreshToken: Payload = this.jwtAdapter.decodeJWT(
      command.refreshToken,
    );
    const userId = Number(payloadRefreshToken.userId);
    const foundSessions =
      await this.sessionsQueryRepository.getAllSessionsForUser(userId);

    if (!foundSessions)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'refreshToken',
        message: 'Sessions not Found',
      });
    return foundSessions.map(sessionViewMapper);
  }
}
