import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { AuthService } from './application/auth.service';
import { SessionsService } from './application/sessions.service';
import { UsersController } from './api/users.controller';
import { AuthController } from './api/auth.controller';
import { SessionsController } from './api/sessions.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { FindAllUsersUseCase } from './application/use-cases/sessions-use-cases/find-sessions-use-case';
import { DeleteAllExcludeUserUseCase } from './application/use-cases/sessions-use-cases/delete-all-exclude-user-use-case';
import { DeleteSessionByDeviceIdUseCase } from './application/use-cases/sessions-use-cases/delete-session-by-user-use-case';
import { CreateUserUseCase } from './application/use-cases/user-use-cases/create-user-use-case';
import { DeleteUserUseCase } from './application/use-cases/user-use-cases/delete-user-use-case';
import { LoginUseCase } from './application/use-cases/auth-use-cases/login-use-case';
import { RecoveryPasswordUseCase } from './application/use-cases/auth-use-cases/recovery-password-use-case';
import { ConfirmPasswordRecoveryUseCase } from './application/use-cases/auth-use-cases/confirm-password-use-case';
import { ConfirmRegistrationUseCase } from './application/use-cases/auth-use-cases/confirm-registration-use-case';
import { RegistrationInSystemUseCase } from './application/use-cases/auth-use-cases/registration-in-system-use-case';
import { ResendEmailResendingEmailUseCase } from './application/use-cases/auth-use-cases/resend-confirmation-email-use-case';
import { LogoutUseCase } from './application/use-cases/auth-use-cases/logout-use-case';
import { RefreshTokensUseCase } from './application/use-cases/auth-use-cases/refresh-tokens-use-case';
import { BcryptAdapter } from './application/adapters/bcryptAdapter/bcrypt.adapter';
import { EmailAdapter } from './application/adapters/emailAdapter/email-adapter';
import { JwtAdapter } from './application/adapters/jwtAdapter/jwt-adapter.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { BasicStrategy } from './guards/basic/basic.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { JwtRefreshStrategy } from './guards/jwtRefresh/refreshToken.strategy';
import { settings } from './guards/constants';
import { PassportModule } from '@nestjs/passport';
import { UsersRepository } from './repositories/userRepositories/users.repository';
import { SessionsRepository } from './repositories/sessionRepositories/sessions.repository';
import { UsersQueryRepository } from './repositories/userRepositories/users.queryRepository';
import { InfoAboutMeQueryHandler } from './application/query-handler/auth-query-handler/get-infoAboutMe-query-handler.-ts';

const services = [UsersService, AuthService, SessionsService];
const repositories = [UsersRepository, SessionsRepository];
const queryRepositories = [UsersQueryRepository];
const sessionUseCases = [
  FindAllUsersUseCase,
  DeleteAllExcludeUserUseCase,
  DeleteSessionByDeviceIdUseCase,
];
const userUseCases = [CreateUserUseCase, DeleteUserUseCase];
const authUseCases = [
  LoginUseCase,
  RecoveryPasswordUseCase,
  ConfirmPasswordRecoveryUseCase,
  ConfirmRegistrationUseCase,
  RegistrationInSystemUseCase,
  ResendEmailResendingEmailUseCase,
  LogoutUseCase,
  RefreshTokensUseCase,
];
const authQueryHandlers = [InfoAboutMeQueryHandler];
const controllers = [UsersController, AuthController, SessionsController];
const errorStrategies = [
  LocalStrategy,
  BasicStrategy,
  JwtStrategy,
  JwtRefreshStrategy,
];

const adapters = [BcryptAdapter, EmailAdapter, JwtAdapter];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: settings.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [...controllers],
  providers: [
    ...errorStrategies,
    ...sessionUseCases,
    ...userUseCases,
    ...authUseCases,
    ...repositories,
    ...queryRepositories,
    ...services,
    ...adapters,
    ...authQueryHandlers,
  ],
  exports: [...errorStrategies],
})
export class UserAccountsModule {}
