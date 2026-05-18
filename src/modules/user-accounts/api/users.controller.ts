import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../guards/basic/basic-auth-guard.service';
import { DeleteUserCommand } from '../application/use-cases/user-use-cases/delete-user-use-case';
import { CreateUserCommand } from '../application/use-cases/user-use-cases/create-user-use-case';
import { InPutPaginationWithSearchLoginTermAndSearchEMailTerm } from '../../../core/types/inputPaginationDtoWithSearchTerms.type';
import { UsersQueryRepository } from '../repositories/userRepositories/users.queryRepository';
import { UserViewType } from './view-types/user/userView.type';
import { FinalViewWithPaginationType } from '../../../core/types/finalViewWithPagination.type';
import { UserInputDtoValidation } from '../validation/inputValidationBody.validation';
import { GetAllUsersQuery } from '../application/query-handler/user-query-hanlder/get-allUsers-query-handler';
import { GetUserByIdQuery } from '../application/query-handler/user-query-hanlder/get_userById_query_handler';

@Controller(`sa/users`)
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    @Inject(UsersQueryRepository)
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllUsers(
    @Query() query: InPutPaginationWithSearchLoginTermAndSearchEMailTerm,
  ): Promise<FinalViewWithPaginationType<UserViewType>> {
    return this.queryBus.execute(new GetAllUsersQuery(query));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() userInputDto: UserInputDtoValidation) {
    const createdUserId: string = await this.commandBus.execute(
      new CreateUserCommand(userInputDto),
    );
    return await this.queryBus.execute(new GetUserByIdQuery(createdUserId));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(`:id`)
  async deleteUser(@Param('id') userId: string) {
    await this.commandBus.execute(new DeleteUserCommand(userId));
  }
}
