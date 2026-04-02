import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtAdapter } from '../../adapters/jwtAdapter/jwt-adapter.service';
import { Payload } from '../../../../../core/types/payload.type';
import { SessionsRepository } from '../../../repositories/sessionRepositories/sessions.repository';
import { SessionViewType } from '../../../api/view-types/sessions/sessionView.type';

export class FindAllSessionsCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(FindAllSessionsCommand)
export class FindAllUsersUseCase implements ICommandHandler<FindAllSessionsCommand> {
  constructor(
    @Inject(SessionsRepository) private sessionsRepository: SessionsRepository,
    @Inject(JwtAdapter) private jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: FindAllSessionsCommand): Promise<SessionViewType[]> {
    const payloadRefreshToken: Payload = this.jwtAdapter.decodeJWT(
      command.refreshToken,
    );
    const userId = payloadRefreshToken.userId;
    return await this.sessionsRepository.findAllSessions(userId);
  }
}
