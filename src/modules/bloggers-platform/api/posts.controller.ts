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
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BearerGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { InPutLikeStatusValidation } from '../validation/InPutLikeStatusValidation';
import { SetLikePostCommand } from '../application/use-cases/post-use-cases/setLike-post-use-case';
import { ContentInputDto } from '../domain/entities/comments.entity';
import { CreateCommentCommand } from '../application/use-cases/comment-use-cases/create-comment-use-case';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth-guard.service';
import { PostInputDtoValidationForCreate } from '../domain/entities/posts.entity';
import { CreatePostCommand } from '../application/use-cases/post-use-cases/create-post-use-case';
import { UpdatePostCommand } from '../application/use-cases/post-use-cases/update-post-use-case';
import { DeletePostCommand } from '../application/use-cases/post-use-cases/delete-post-use-case';
import { InputQueryPaginationTypeWithSearchName } from '../../../core/pagination/inputQueryPaginationTypeWithSearchName';
import { CommentsQueryRepository } from '../repositories/commentsRepositories/comments.queryRepository';
import { GetAllPostsQuery } from '../application/query-handlers/post-query-handlers/get-allPosts-query-handler';
import { PostViewType } from './view-types/posts/postView.type';
import { FinalViewWithPaginationType } from '../../../core/types/finalViewWithPagination.type';
import { CommentViewType } from './view-types/comments/commentView.type';
import { FindPostByPostIdQuery } from '../application/query-handlers/post-query-handlers/get-postById-query-handler';
import { PostViewWithLikesType } from './view-types/posts/postViewWithLikes.type';
import { FindAllCommentsByPostIdQuery } from '../application/query-handlers/comment-query-handlers/get-allCommentByPostId-query-handler';
import { LikeEntityForCommentWithLikeStatusType } from '../repositories/entity-types/likeEntityForComment.type';
import { User } from '../../user-accounts/domain/entities/users.entity';
import { OptionalBearerGuard } from '../../user-accounts/guards/bearer/optional-bearer-guard';
import { FindCommentByIdQuery } from '../application/query-handlers/comment-query-handlers/get-commentById-query-handler';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    @Inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async setLikeForPost(
    @Req() req: Request & { user: User },
    @Param('id') postId: string,
    @Body() likeStatus: InPutLikeStatusValidation,
  ): Promise<void> {
    await this.commandBus.execute(
      new SetLikePostCommand(postId, likeStatus.likeStatus, req.user),
    );
    return;
  }
  @UseGuards(OptionalBearerGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id/comments')
  async getAllCommentsByPostId(
    @Param('id') postId: string,
    @Query() pagination: InputQueryPaginationTypeWithSearchName,
    @Req() req: Request & { user: User },
  ): Promise<
    FinalViewWithPaginationType<LikeEntityForCommentWithLikeStatusType>
  > {
    return this.queryBus.execute(
      new FindAllCommentsByPostIdQuery(postId, pagination, req.user?.id),
    );
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/comments')
  async createComment(
    @Req() req: Request & { user: User },
    @Param('id') postId: string,
    @Body() contentDto: ContentInputDto,
  ): Promise<CommentViewType> {
    const createdCommentId: string = await this.commandBus.execute(
      new CreateCommentCommand(
        postId,
        contentDto.content,
        req.user.id,
        req.user.login,
      ),
    );

    return await this.queryBus.execute(
      new FindCommentByIdQuery(createdCommentId, req.user.id),
    );
  }

  @UseGuards(OptionalBearerGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllPosts(
    @Query() query: InputQueryPaginationTypeWithSearchName,
    @Req() req: Request & { user: User | null },
  ): Promise<FinalViewWithPaginationType<PostViewType>> {
    const userId = req.user?.id?.toString() ?? null;

    return this.queryBus.execute(new GetAllPostsQuery(query, userId));
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPost(
    @Body() postInputDto: PostInputDtoValidationForCreate,
  ): Promise<PostViewWithLikesType> {
    const postId: string = await this.commandBus.execute(
      new CreatePostCommand(postInputDto),
    );
    return this.queryBus.execute(new FindPostByPostIdQuery(postId));
  } //

  @UseGuards(OptionalBearerGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findPostById(
    @Param('id') postId: string,
    @Req() req: Request & { user: User },
  ): Promise<PostViewWithLikesType> {
    return await this.queryBus.execute(
      new FindPostByPostIdQuery(postId, req.user?.id?.toString()),
    );
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePostById(
    @Param('id') postId: string,
    @Body() inputDto: PostInputDtoValidationForCreate,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(postId, inputDto));
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(@Param('id') postId: string): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(postId));
    return;
  }
}
