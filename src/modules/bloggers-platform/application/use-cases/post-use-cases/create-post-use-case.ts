import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputDtoValidationForCreate } from '../../../domain/entities/posts.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { PostsQueryRepository } from '../../../repositories/postsRepositories/posts.queryRepository';

export class CreatePostCommand {
  constructor(public inputDto: PostInputDtoValidationForCreate) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const foundBlog = await this.blogsRepository.findBlogByBlogId(
      command.inputDto.blogId,
    );

    if (!foundBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'blogId',
        message: 'Blog not found.',
      });
    }
    const createdPostId: string = await this.postsRepository.createPost(
      foundBlog.id.toString(),
      foundBlog.name,
      command.inputDto,
    );

    return createdPostId;
  }
}
