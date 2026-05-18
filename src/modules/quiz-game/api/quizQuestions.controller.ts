import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Body,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllQuestionsQuery } from '../aplication/query-handler/quizQuestions-query-handlers/get-allQuizQuestions-query-handler';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth-guard.service';
import { GetQuizQuestionByIdQuery } from '../aplication/query-handler/quizQuestions-query-handlers/get-quizQuestionById-query-handler';
import { DeleteQuestionByIdCommand } from '../aplication/use-cases/quizQuestions-use-cases/delete_question_use_case';
import { CreateQuestionCommand } from '../aplication/use-cases/quizQuestions-use-cases/create_question_use_case';
import { UpdateQuestionCommand } from '../aplication/use-cases/quizQuestions-use-cases/update_questions_use_case';
import { PublishedQuestionCommand } from '../aplication/use-cases/quizQuestions-use-cases/published_question_use_case';
import { FinalViewWithPaginationType } from '../../../core/types/finalViewWithPagination.type';
import { QuestionView } from './view_types/questions/questionView.type';
import { InputPaginationTypeForQuestion } from './input_dto_types/questions/questions_inputDto.type';
import { QuestionInputQueryDto } from './input_dto_types/questions/questions_inputQueryDto.type';
import { IsBoolean } from 'class-validator';
import { SkipThrottle } from '@nestjs/throttler';

export class ChekBoolean {
  @IsBoolean()
  published: boolean;
}
@SkipThrottle()
@Controller('sa/quiz/questions')
export class QuizGameQuestionsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllQuestions(
    @Query() query: QuestionInputQueryDto,
  ): Promise<FinalViewWithPaginationType<QuestionView>> {
    return await this.queryBus.execute(new GetAllQuestionsQuery(query));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createQuestion(
    @Body() question: InputPaginationTypeForQuestion,
  ): Promise<QuestionView> {
    const createdQuestionId: string = await this.commandBus.execute(
      new CreateQuestionCommand(question),
    );
    return await this.queryBus.execute(
      new GetQuizQuestionByIdQuery(createdQuestionId),
    );
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteQuestion(@Param('id') id: string): Promise<void> {
    return await this.commandBus.execute(new DeleteQuestionByIdCommand(id));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: InputPaginationTypeForQuestion,
  ): Promise<void> {
    return await this.commandBus.execute(new UpdateQuestionCommand(id, dto));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/publish')
  async publishedQuestion(
    @Param('id') id: string,
    @Body() published: ChekBoolean,
  ): Promise<void> {
    return await this.commandBus.execute(
      new PublishedQuestionCommand(id, published),
    );
  }
}
