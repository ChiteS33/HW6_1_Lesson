import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Game } from '../../../domain/entities/quiz_games.entity';
import { QuizGameQueryRepository } from '../../../repositories/gameRepository/quiz-game-query-repository';

import { viewGameQuizMapper } from '../../use-cases/quizGame_use_cases/connect_user_use_case';

export class GetGameByIdQuery {
  constructor(
    public gameId: number,
    public userId: string,
  ) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdQueryHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(
    @Inject(QuizGameQueryRepository)
    private gameQueryRepository: QuizGameQueryRepository,
  ) {}

  async execute(query: GetGameByIdQuery): Promise<any> {
    const foundGame: Game | null = await this.gameQueryRepository.findGameById(
      query.gameId,
    );

    if (!foundGame)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'gameId',
        message: 'Game not found',
      });
    const checkingPlayerAccess = foundGame?.players.some(
      (player) => player.user.id === Number(query.userId),
    );

    if (!checkingPlayerAccess)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        field: 'userId',
        message: 'Player has`t access',
      });
    return viewGameQuizMapper(foundGame);
  }
}
