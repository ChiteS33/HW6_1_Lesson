import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BearerGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { InPutLikeStatusValidation } from '../validation/InPutLikeStatusValidation';
import { ContentInputDto } from '../domain/entities/comments.entity';
import { UpdateCommentCommand } from '../application/use-cases/comment-use-cases/update-comment-use-case';
import { DeleteCommentCommand } from '../application/use-cases/comment-use-cases/delete-comment-use-case';
import { OptionalBearerGuard } from '../../user-accounts/guards/bearer/optional-bearer-guard.service';

import { CommentViewType } from './view-types/comments/commentView.type';
import { FindCommentByIdQuery } from '../application/query-handlers/comment-query-handlers/get-commentById-query-handler';
import { SetLikeCommentsCommand } from '../application/use-cases/comment-use-cases/setLike-comments-use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async setLike(
    @Req() req: Request & { user: any },
    @Param('id') commentId: string,
    @Body() likeStatus: InPutLikeStatusValidation,
  ): Promise<void> {
    await this.commandBus.execute(
      new SetLikeCommentsCommand(commentId, likeStatus.likeStatus, req.user),
    ); //
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateComment(
    @Req() req: Request & { user: any },
    @Param('id') commentId: string,
    @Body() content: ContentInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, content.content, req.user.id),
    );
  } //

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteComment(
    @Param('id') commentId: string,
    @Req() req: Request & { user: any },
  ): Promise<void> {
    const userId = req.user?.id?.toString();
    return this.commandBus.execute(new DeleteCommentCommand(commentId, userId));
  } //

  @UseGuards(OptionalBearerGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findCommentById(
    @Param('id') commentId: string,
    @Req() req: Request & { user: any },
  ): Promise<CommentViewType | null> {
    const userId = req.user?.id?.toString();
    return this.queryBus.execute(new FindCommentByIdQuery(commentId, userId));
  } //
}
