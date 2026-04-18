import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth-guard.service';
import { BlogInputDto } from '../domain/entities/blogs.entity';
import { CreateBlogSaCommand } from '../application/use-cases/blogSa-use-cases/create-blog-sa-use-case';
import { PostInputDtoValidation } from '../domain/entities/posts.entity';
import { UpdateBlogSaCommand } from '../application/use-cases/blogSa-use-cases/update-blog-sa-use-case';
import { DeleteBlogSaCommand } from '../application/use-cases/blogSa-use-cases/delete-blog-sa-use-case';
import { UpdatePostByBlogIdSaCommand } from '../application/use-cases/post-use-cases/update-post-by-blog-id-sa-use-case';
import { InputQueryPaginationTypeWithSearchName } from '../../../core/pagination/inputQueryPaginationTypeWithSearchName';
import { inPutValidationPagination } from '../../../core/types/inPutValidationPagination.validation';
import { GetAllBlogsSaQuery } from '../application/query-handlers/blogSa-query-handlers/get-allBlogsSa-query-handler';
import { CreatePostByBlogIdSaCommand } from '../application/use-cases/blogSa-use-cases/create-post-by-blogId-sa-use-case';
import { GetAllPostsByBlogIdSaQuery } from '../application/query-handlers/blogSa-query-handlers/get-allPostsByBlogIdSa-query-handler';
import { DeletePostByBlogIdSaCommand } from '../application/use-cases/blogSa-use-cases/delete-post-by-blogId-sa-use-case';
import { FinalViewWithPaginationType } from '../../../core/types/finalViewWithPagination.type';
import { BlogViewType } from './view-types/blogs/blogView.type';
import { PostViewType } from './view-types/posts/postView.type';
import { PostViewWithLikesType } from './view-types/posts/postViewWithLikes.type';
import { FindPostByPostIdQuery } from '../application/query-handlers/post-query-handlers/get-postById-query-handler';
import { GetBlogsByBlogIdQuery } from '../application/query-handlers/blog-query-handlers/get-blogById-query-handler';

@Controller('sa/blogs')
export class BlogsControllerSa {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllBlogsBySa(
    @Query() query: InputQueryPaginationTypeWithSearchName,
  ): Promise<FinalViewWithPaginationType<BlogViewType>> {
    return await this.queryBus.execute(new GetAllBlogsSaQuery(query));
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(@Body() blogInputDto: BlogInputDto): Promise<BlogViewType> {
    const createdBlogId: string = await this.commandBus.execute(
      new CreateBlogSaCommand(blogInputDto),
    );
    return await this.queryBus.execute(
      new GetBlogsByBlogIdQuery(createdBlogId),
    );
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlogById(
    @Param('id') blogId: string,
    @Body() blogInputDto: BlogInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateBlogSaCommand(blogId, blogInputDto),
    );
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogSaCommand(blogId));
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() postInputDto: PostInputDtoValidation,
  ): Promise<PostViewWithLikesType> {
    const id: string = await this.commandBus.execute(
      new CreatePostByBlogIdSaCommand(blogId, postInputDto),
    );
    return this.queryBus.execute(new FindPostByPostIdQuery(id));
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id/posts')
  async findAllPostsByBlogId(
    @Param('id') blogId: string,
    @Query() query: inPutValidationPagination,
  ): Promise<FinalViewWithPaginationType<PostViewType>> {
    return this.queryBus.execute(new GetAllPostsByBlogIdSaQuery(blogId, query));
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/posts/:postId')
  async updatePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() postInputDto: PostInputDtoValidation,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdatePostByBlogIdSaCommand(blogId, postId, postInputDto),
    );
    return;
  } //

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId/posts/:postId')
  async deletePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeletePostByBlogIdSaCommand(postId, blogId),
    );
    return;
  } //
}
