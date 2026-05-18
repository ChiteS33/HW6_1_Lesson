import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BearerGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../../user-accounts/domain/entities/users.entity';
import { ConnectUserCommand } from '../aplication/use-cases/quizGame_use_cases/connect_user_use_case';
import { GetCurrentUnfinishedGameQuery } from '../aplication/query-handler/quiz_game_query_handlers/get_quiz_current_unfinished_game_query_handler';
import { Game } from '../domain/entities/quiz_games.entity';
import { GetGameByIdQuery } from '../aplication/query-handler/quiz_game_query_handlers/get_quiz_game_by_id_query_handler';
import { GetCurrentAnswerCommand } from '../aplication/use-cases/quizGame_use_cases/get_current_answer_use_case';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('pair-game-quiz/pairs')
export class QuizGameController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  // @UseGuards(BearerGuard)
  // @HttpCode(HttpStatus.OK)
  // @Get('/my')
  // async getAllMyGames(@Req() req: Request & { user: User }): Promise<Game[]> {
  //   const userId = req.user.id.toString();
  //   return this.queryBus.execute()
  // }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/my-current')
  async getCurrentUnfinishedGame(
    @Req() req: Request & { user: User },
  ): Promise<Game> {
    const userId = req.user.id.toString();
    return this.queryBus.execute(new GetCurrentUnfinishedGameQuery(userId));
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getGameById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: User },
  ): Promise<Game> {
    const userId = req.user.id.toString();
    return this.queryBus.execute(new GetGameByIdQuery(id, userId));
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/connection')
  async connectUser(@Req() req: Request & { user: User }) {
    const userId = req.user.id.toString();
    return this.commandBus.execute(new ConnectUserCommand(userId));
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/my-current/answers')
  async getMyCurrentAnswer(
    @Req() req: Request & { user: User },
    @Body() body: { answer: string },
  ) {
    const userId = req.user.id.toString();
    return this.commandBus.execute(new GetCurrentAnswerCommand(userId, body));
  }
}
