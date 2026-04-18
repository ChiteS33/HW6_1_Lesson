import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Post,
  PostInputDtoValidation,
} from '../../../domain/entities/posts.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Inject } from '@nestjs/common';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { PostsQueryRepository } from '../../../repositories/postsRepositories/posts.queryRepository';

export class CreatePostByBlogIdSaCommand {
  constructor(
    public blogId: string,
    public postInputDto: PostInputDtoValidation,
  ) {}
}

@CommandHandler(CreatePostByBlogIdSaCommand)
export class CreatePostByBlogIdSaUseCase implements ICommandHandler<CreatePostByBlogIdSaCommand> {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: CreatePostByBlogIdSaCommand): Promise<string> {
    const foundBlog = await this.blogsRepository.findBlogByBlogId(
      Number(command.blogId),
    );
    if (!foundBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'blogId',
        message: 'Blog not found.',
      });
    }
    const newPost = Post.createPost({
      ...command.postInputDto,
      blogId: Number(command.blogId),
    });
    return await this.postsRepository.save(newPost);
  }
}
