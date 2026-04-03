import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../adapters/jwtAdapter/jwt-adapter.service';
import { AuthService } from '../../auth.service';
import { inputValidationLoginOrEmailAndPass } from '../../../validation/inputValidationLoginOrEmailAndPass.validation';
import { Payload } from '../../../../../core/types/payload.type';
import { SessionsRepository } from '../../../repositories/sessionRepositories/sessions.repository';
import { User } from '../../../domain/entities/users.entity';
import { Session } from '../../../domain/entities/sessions.entity';

export class LoginUseCommand {
  constructor(
    public user: User,
    public body: inputValidationLoginOrEmailAndPass,
    public deviceName: string,
    public sessionIp: string,
  ) {}
}

@CommandHandler(LoginUseCommand)
export class LoginUseCase implements ICommandHandler<LoginUseCommand> {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(JwtAdapter) private jwtService: JwtAdapter,
    @Inject(SessionsRepository) private sessionsRepository: SessionsRepository,
  ) {}
  async execute(
    command: LoginUseCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    await this.authService.checkingUser(command.body);
    const userId = command.user.id.toString();
    const accessToken = this.jwtService.createJWT(userId);
    const refreshToken = this.jwtService.createRefreshToken(userId);
    const payload: Payload = this.jwtService.decodeJWT(refreshToken);

    const createSession = Session.createSession(
      payload,
      command.sessionIp,
      command.deviceName,
    );
    await this.sessionsRepository.save(createSession);
    return { accessToken, refreshToken };
  }
}
