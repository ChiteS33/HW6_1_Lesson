import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { QuizGameQuestionsController } from './api/quizQuestions.controller';
import { QuizQuestionsQueryRepository } from './repositories/quizQuestionsRepository/questions.queryRepository';
import { GetAllQuizQuestionsQueryHandler } from './aplication/query-handler/quizQuestions-query-handlers/get-allQuizQuestions-query-handler';
import { GetQuizQuestionByIdQueryHandler } from './aplication/query-handler/quizQuestions-query-handlers/get-quizQuestionById-query-handler';
import { QuizQuestionsRepository } from './repositories/quizQuestionsRepository/questions.repository';
import { CreateQuestionUseCase } from './aplication/use-cases/quizQuestions-use-cases/create_question_use_case';
import { DeleteQuestionByIdUseCase } from './aplication/use-cases/quizQuestions-use-cases/delete_question_use_case';
import { UpdateQuestionUseCase } from './aplication/use-cases/quizQuestions-use-cases/update_questions_use_case';
import { PublishedQuestionUseCase } from './aplication/use-cases/quizQuestions-use-cases/published_question_use_case';
import { ConnectUserUseCase } from './aplication/use-cases/quizGame_use_cases/connect_user_use_case';
import { PlayersRepository } from './repositories/playersRepository/players.repository';
import { GameRepository } from './repositories/gameRepository/game.repository';
import { QuizGameController } from './api/quizGame.controller';
import { User } from '../user-accounts/domain/entities/users.entity';
import { UsersRepository } from '../user-accounts/repositories/userRepositories/users.repository';
import { Question } from './domain/entities/quiz_questions.entity';
import { Game } from './domain/entities/quiz_games.entity';
import { QuestionForGame } from './domain/entities/quiz_game_questions.entity';
import { Player } from './domain/entities/quiz_players.entity';
import { QuestionForGameRepository } from './repositories/question_for_game/question_for_game.repository';
import { PlayerAnswer } from './domain/entities/quiz_player_answers.entity';
import { GetGameByIdQueryHandler } from './aplication/query-handler/quiz_game_query_handlers/get_quiz_game_by_id_query_handler';
import { QuizGameQueryRepository } from './repositories/gameRepository/quiz-game-query-repository';
import { GetCurrentUnfinishedGameQueryHandler } from './aplication/query-handler/quiz_game_query_handlers/get_quiz_current_unfinished_game_query_handler';
import { UsersQueryRepository } from '../user-accounts/repositories/userRepositories/users.queryRepository';
import { PlayersQueryRepository } from './repositories/playersRepository/players.query_repository';
import { GetCurrentAnswerUseCase } from './aplication/use-cases/quizGame_use_cases/get_current_answer_use_case';
import { PlayerAnswersRepository } from './repositories/player_answers/player_answers_repository';

const controllers = [QuizGameQuestionsController, QuizGameController];
const services = [];
const repositories = [
  QuizQuestionsRepository,
  PlayersRepository,
  GameRepository,
  UsersRepository,
];
const queryRepositories = [
  QuestionForGameRepository,
  QuizQuestionsQueryRepository,
  QuizGameQueryRepository,
  PlayersQueryRepository,
  UsersQueryRepository,
  PlayerAnswersRepository,
];
const queryHandlers = [
  GetAllQuizQuestionsQueryHandler,
  GetQuizQuestionByIdQueryHandler,
  GetGameByIdQueryHandler,
  GetCurrentUnfinishedGameQueryHandler,
];
const useCases = [
  CreateQuestionUseCase,
  DeleteQuestionByIdUseCase,
  UpdateQuestionUseCase,
  PublishedQuestionUseCase,
  ConnectUserUseCase,
  GetCurrentAnswerUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      QuestionForGame,
      Game,
      QuestionForGame,
      Player,
      User,
      PlayerAnswer,
    ]),
    UserAccountsModule,
    CqrsModule,
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...queryRepositories,
    ...repositories,
    ...queryHandlers,
    ...useCases,
  ],
  exports: [],
})
export class QuizGameModule {}
