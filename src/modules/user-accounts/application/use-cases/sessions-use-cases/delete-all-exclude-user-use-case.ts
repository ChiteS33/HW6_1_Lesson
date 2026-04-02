import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtAdapter } from '../../adapters/jwtAdapter/jwt-adapter.service';
import { SessionsRepository } from '../../../repositories/sessionRepositories/sessions.repository';

export class DeleteAllExcludeUserCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteAllExcludeUserCommand)
export class DeleteAllExcludeUserUseCase implements ICommandHandler<DeleteAllExcludeUserCommand> {
  constructor(
    @Inject(SessionsRepository) private sessionsRepository: SessionsRepository,
    @Inject(JwtAdapter) private jwtAdapter: JwtAdapter,
  ) {}

  async execute(command: DeleteAllExcludeUserCommand): Promise<void> {
    const payloadRefreshToken = this.jwtAdapter.decodeJWT(command.refreshToken);
    await this.sessionsRepository.deleteAlmostAll(
      payloadRefreshToken.userId,
      payloadRefreshToken.deviceId,
    );
    return;
  }
}
