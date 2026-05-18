import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UsersQueryRepository } from '../../../../user-accounts/repositories/userRepositories/users.queryRepository';
import { PlayersQueryRepository } from '../../../repositories/playersRepository/players.query_repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { QuizGameQueryRepository } from '../../../repositories/gameRepository/quiz-game-query-repository';
import { viewGameQuizMapper } from '../../use-cases/quizGame_use_cases/connect_user_use_case';
import { log } from 'node:util';

export class GetCurrentUnfinishedGameQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetCurrentUnfinishedGameQuery)
export class GetCurrentUnfinishedGameQueryHandler implements IQueryHandler<GetCurrentUnfinishedGameQuery> {
  constructor(
    @Inject(UsersQueryRepository)
    private usersQueryRepository: UsersQueryRepository,
    @Inject(PlayersQueryRepository)
    private playersQueryRepository: PlayersQueryRepository,
    @Inject(QuizGameQueryRepository)
    private quizGameQueryRepository: QuizGameQueryRepository,
  ) {}

  async execute(query: GetCurrentUnfinishedGameQuery): Promise<any> {
    const foundUser = await this.usersQueryRepository.findUserByUserId(
      Number(query.userId),
    );

    if (!foundUser)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'userId',
        message: 'User not found',
      });
    // const foundPlayer = await this.playersQueryRepository.findPlayerByUserId(
    //   Number(query.userId),
    // );
    const foundPlayer =
      await this.playersQueryRepository.findPlayerByUserIdAndGameId(
        Number(query.userId),
      );
    if (!foundPlayer)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'userId',
        message: 'Player not found',
      });

    const foundCurrentGame = await this.quizGameQueryRepository.findCurrentGame(
      foundPlayer.gameId!,
    );

    if (!foundCurrentGame)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'gameId',
        message: 'Game not found',
      });

    return viewGameQuizMapper(foundCurrentGame);
  }
}
