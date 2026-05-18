import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Get,
  Body,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { InputValidationEmail } from '../validation/inputValidationEmail.validation';
import { RecoveryPasswordCommand } from '../application/use-cases/auth-use-cases/recovery-password-use-case';
import { ConfirmPasswordRecoveryCommand } from '../application/use-cases/auth-use-cases/confirm-password-use-case';
import { inputValidationPasswordAndRecoveryCode } from '../validation/inputValidationPasswordAndRecoveryCode.validation';
import { LocalGuard } from '../guards/local/local-guard.service';
import { LoginUseCommand } from '../application/use-cases/auth-use-cases/login-use-case';
import { inputValidationLoginOrEmailAndPass } from '../validation/inputValidationLoginOrEmailAndPass.validation';
import { JwtRefreshGuard } from '../guards/jwtRefresh/refreshTokenGuard';
import { RefreshTokensCommand } from '../application/use-cases/auth-use-cases/refresh-tokens-use-case';
import { InputValidationCode } from '../validation/inputValidationCode.validation';
import { ConfirmRegistrationCommand } from '../application/use-cases/auth-use-cases/confirm-registration-use-case';
import { RegistrationInSystemCommand } from '../application/use-cases/auth-use-cases/registration-in-system-use-case';
import { ResendEmailResendingEmailCommand } from '../application/use-cases/auth-use-cases/resend-confirmation-email-use-case';
import { LogoutCommand } from '../application/use-cases/auth-use-cases/logout-use-case';
import { BearerGuard } from '../guards/bearer/jwt-auth.guard';
import { PairTokens } from '../../../core/types/pairTokens.type';
import { ViewAboutMeType } from './view-types/auth/authViewAboutMe.type';
import { UserInputDtoValidation } from '../validation/inputValidationBody.validation';
import { InfoAboutMeQuery } from '../application/query-handler/auth-query-handler/get-infoAboutMe-query-handler';
import { User } from '../domain/entities/users.entity';
@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async recoveryPassword(@Body() dto: InputValidationEmail): Promise<void> {
    await this.commandBus.execute(new RecoveryPasswordCommand(dto.email));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async confirmPasswordRecovery(
    @Body() dto: inputValidationPasswordAndRecoveryCode,
  ): Promise<void> {
    await this.commandBus.execute(
      new ConfirmPasswordRecoveryCommand(dto.newPassword, dto.recoveryCode),
    );
  }

  @UseGuards(ThrottlerGuard, LocalGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Req() req: Request & { user: User },
    @Body() body: inputValidationLoginOrEmailAndPass,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens: PairTokens = await this.commandBus.execute(
      new LoginUseCommand(
        req.user,
        body,
        req.headers['user-agent'] as string,
        req.ip as string,
      ),
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 20 * 10000,
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshPairTokens(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken as string;
    const tokens: PairTokens = await this.commandBus.execute(
      new RefreshTokensCommand(refreshToken),
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 20 * 100000,
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmRegistration(@Body() dto: InputValidationCode) {
    await this.commandBus.execute(new ConfirmRegistrationCommand(dto.code));
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registrationInSystem(@Body() dto: UserInputDtoValidation) {
    await this.commandBus.execute(new RegistrationInSystemCommand(dto));
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendEmail(@Body() dto: InputValidationEmail) {
    await this.commandBus.execute(
      new ResendEmailResendingEmailCommand(dto.email),
    );
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Req() req: Request & { user: User }) {
    const refreshToken = req.cookies.refreshToken as string;
    await this.commandBus.execute(new LogoutCommand(refreshToken));
    return;
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async infoAboutMe(
    @Req() req: Request & { user: User },
  ): Promise<ViewAboutMeType> {
    return await this.queryBus.execute(new InfoAboutMeQuery(req.user));
  }
}
