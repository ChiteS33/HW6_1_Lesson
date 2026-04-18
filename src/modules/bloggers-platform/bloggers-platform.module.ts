import { DeleteAllController } from '../../test/test.controller';
import { PostsController } from './api/posts.controller';
import { CommentsController } from './api/comments.controller';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './application/use-cases/post-use-cases/create-post-use-case';
import { DeletePostUseCase } from './application/use-cases/post-use-cases/delete-post-use-case';
import { UpdatePostUseCase } from './application/use-cases/post-use-cases/update-post-use-case';
import { SetLikePostUseCase } from './application/use-cases/post-use-cases/setLike-post-use-case';
import { BlogsService } from './application/blogs.service';
import { PostService } from './application/posts.service';
import { CommentsService } from './application/comments.service';
import { CreateBlogSaUseCase } from './application/use-cases/blogSa-use-cases/create-blog-sa-use-case';
import { UpdateBlogSaUseCase } from './application/use-cases/blogSa-use-cases/update-blog-sa-use-case';
import { DeleteBlogSaUseCase } from './application/use-cases/blogSa-use-cases/delete-blog-sa-use-case';
import { CreateCommentUseCase } from './application/use-cases/comment-use-cases/create-comment-use-case';
import { DeleteCommentUseCase } from './application/use-cases/comment-use-cases/delete-comment-use-case';
import { UpdateCommentUseCase } from './application/use-cases/comment-use-cases/update-comment-use-case';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsControllerSa } from './api/blogsSa.controller';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './repositories/blogsRepositories/blogs.repository';
import { PostsRepository } from './repositories/postsRepositories/posts.repository';
import { CommentsRepository } from './repositories/commentsRepositories/comments.repository';
import { LikesForPostRepository } from './repositories/likesForPostRepositories/post.likes.repository';
import { LikesForCommentRepository } from './repositories/likesForCommentRepositories/comment.likes.repository';
import { BlogsQueryRepository } from './repositories/blogsRepositories/blogs.queryRepository';
import { PostsQueryRepository } from './repositories/postsRepositories/posts.queryRepository';
import { CommentsQueryRepository } from './repositories/commentsRepositories/comments.queryRepository';
import { GetAllBlogsQueryHandlers } from './application/query-handlers/blog-query-handlers/get-allBlogs-query-handler';
import { GetBlogsByBlogIdQueryHandler } from './application/query-handlers/blog-query-handlers/get-blogById-query-handler';
import { GetAllPostsQueryHandler } from './application/query-handlers/post-query-handlers/get-allPosts-query-handler';
import { GetAllBlogsSaQueryHandler } from './application/query-handlers/blogSa-query-handlers/get-allBlogsSa-query-handler';
import { GetAllPostsByBlogIdSaQueryHandler } from './application/query-handlers/blogSa-query-handlers/get-allPostsByBlogIdSa-query-handler';
import { GetAllPostsByBlogIdQueryHandler } from './application/query-handlers/blog-query-handlers/get-allPostsByBlogId-query-handler';
import { CreatePostByBlogIdSaUseCase } from './application/use-cases/blogSa-use-cases/create-post-by-blogId-sa-use-case';
import { DeletePostByBlogIdSaUseCase } from './application/use-cases/blogSa-use-cases/delete-post-by-blogId-sa-use-case';
import { UpdatePostByBlogIdSaUseCase } from './application/use-cases/post-use-cases/update-post-by-blog-id-sa-use-case';
import { SetLikeCommentsUseCase } from './application/use-cases/comment-use-cases/setLike-comments-use-case';
import { GetCommentByIdQueryHandler } from './application/query-handlers/comment-query-handlers/get-commentById-query-handler';
import { GetPostByPostIdQueryHandler } from './application/query-handlers/post-query-handlers/get-postById-query-handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './domain/entities/blogs.entity';
import { Post } from './domain/entities/posts.entity';
import { LikeForPost } from './domain/entities/likesForPosts.entity';
import { LikesForComment } from './domain/entities/likesForComments.entity';
import { Comment } from './domain/entities/comments.entity';
import { FindAllCommentsByPostIdQueryHandler } from './application/query-handlers/comment-query-handlers/get-allCommentByPostId-query-handler';

const services = [BlogsService, PostService, CommentsService];
const repositories = [
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
  LikesForPostRepository,
  LikesForCommentRepository,
];
const queryRepositories = [
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
];
const blogQueryHandlers = [
  GetAllBlogsQueryHandlers,
  GetAllPostsByBlogIdQueryHandler,
  GetBlogsByBlogIdQueryHandler,
];
const blogQueryHandlersSa = [
  GetAllBlogsSaQueryHandler,
  GetAllPostsByBlogIdSaQueryHandler,
];
const commentQueryHandlers = [GetCommentByIdQueryHandler];
const postQueryHandlers = [
  GetAllPostsQueryHandler,
  GetPostByPostIdQueryHandler,
  FindAllCommentsByPostIdQueryHandler,
];
const blogSaUseCases = [
  CreateBlogSaUseCase,
  CreatePostByBlogIdSaUseCase,
  DeletePostByBlogIdSaUseCase,
  UpdatePostByBlogIdSaUseCase,
  UpdateBlogSaUseCase,
  DeleteBlogSaUseCase,
];
const commentsUseCases = [
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  SetLikeCommentsUseCase,
];
const postsUseCases = [
  CreatePostUseCase,
  SetLikePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
];
const controllers = [
  DeleteAllController,
  BlogsControllerSa,
  BlogsController,
  PostsController,
  CommentsController,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
    TypeOrmModule.forFeature([
      Blog,
      Post,
      Comment,
      LikeForPost,
      LikesForComment,
    ]),
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...repositories,
    ...queryRepositories,
    ...postsUseCases,
    ...commentsUseCases,
    ...blogSaUseCases,
    ...blogQueryHandlers,
    ...postQueryHandlers,
    ...blogQueryHandlersSa,
    ...commentQueryHandlers,
  ],
  exports: [],
})
export class BlogsModule {}
