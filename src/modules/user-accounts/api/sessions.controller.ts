import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { JwtRefreshGuard } from '../guards/jwtRefresh/refreshTokenGuard';
import { DeleteAllExcludeUserCommand } from '../application/use-cases/sessions-use-cases/delete-all-exclude-user-use-case';
import { DeleteSessionByDeviceIdCommand } from '../application/use-cases/sessions-use-cases/delete-session-by-user-use-case';
import { SessionEntityType } from '../repositories/entity-types/session/sessionEntity.type';
import { User } from '../domain/entities/users.entity';
import { FindAllSessionsQuery } from '../application/query-handler/session-query-handler/find-sessions-query-handler';

@Controller('security/devices')
export class SessionsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllSessionForUser(
    @Req() req: Request & { user: User },
  ): Promise<SessionEntityType[]> {
    const refreshToken = req.cookies.refreshToken as string;
    return this.queryBus.execute(new FindAllSessionsQuery(refreshToken));
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async deleteAllExcludeCurrent(@Req() req: Request & { user: User }) {
    const refreshToken = req.cookies.refreshToken as string;
    await this.commandBus.execute(
      new DeleteAllExcludeUserCommand(refreshToken),
    );
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteByDeviceId(
    @Req() req: Request & { user: User },
    @Param('id') deviceId: string,
  ) {
    const refreshToken = req.cookies.refreshToken as string;
    await this.commandBus.execute(
      new DeleteSessionByDeviceIdCommand(deviceId, refreshToken),
    );
  }
}
