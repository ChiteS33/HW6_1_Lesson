import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { InputQueryPaginationTypeWithSearchName } from '../../../core/pagination/inputQueryPaginationTypeWithSearchName';
import { GetAllBlogsQuery } from '../application/query-handlers/blog-query-handlers/get-allBlogs-query-handler';
import { GetBlogsByBlogIdQuery } from '../application/query-handlers/blog-query-handlers/get-blogById-query-handler';
import { GetAllPostsByBlogIdQuery } from '../application/query-handlers/blog-query-handlers/get-allPostsByBlogId-query-handler';
import { BlogViewType } from './view-types/blogs/blogView.type';
import { PostViewType } from './view-types/posts/postView.type';
import { FinalViewWithPaginationType } from '../../../core/types/finalViewWithPagination.type';
import { User } from '../../user-accounts/domain/entities/users.entity';
import { OptionalBearerGuard } from '../../user-accounts/guards/bearer/optional-bearer-guard';

@Controller('blogs')
export class BlogsController {
  constructor(private queryBus: QueryBus) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllBlogs(
    @Query() query: InputQueryPaginationTypeWithSearchName,
  ): Promise<FinalViewWithPaginationType<BlogViewType>> {
    return await this.queryBus.execute(new GetAllBlogsQuery(query));
  }

  @UseGuards(OptionalBearerGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id/posts')
  async getAllPostsByBlogId(
    @Param('id') blogId: string,
    @Query() query: InputQueryPaginationTypeWithSearchName,
    @Req() req: Request & { user: User },
  ): Promise<FinalViewWithPaginationType<PostViewType>> {
    const userId = req.user?.id?.toString();
    return await this.queryBus.execute(
      new GetAllPostsByBlogIdQuery(blogId, query, userId),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getBlogById(@Param('id') blogId: string): Promise<BlogViewType> {
    return await this.queryBus.execute(new GetBlogsByBlogIdQuery(blogId));
  }
}
