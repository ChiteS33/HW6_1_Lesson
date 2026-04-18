import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Post,
  PostInputDtoValidation,
} from '../../../domain/entities/posts.entity';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Blog } from '../../../domain/entities/blogs.entity';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';

export class UpdatePostByBlogIdSaCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public postInputDto: PostInputDtoValidation,
  ) {}
}

@CommandHandler(UpdatePostByBlogIdSaCommand)
export class UpdatePostByBlogIdSaUseCase implements ICommandHandler<UpdatePostByBlogIdSaCommand> {
  constructor(
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostByBlogIdSaCommand): Promise<void> {
    await this.findBlogById(command.blogId);

    const foundPost: Post = await this.findPostById(command.postId);
    foundPost.updatePost(command.postInputDto);
    await this.postsRepository.save(foundPost);
    return;
  }

  private async findBlogById(blogId: string): Promise<Blog> {
    const foundBlog = await this.blogsRepository.findBlogByBlogId(
      Number(blogId),
    );
    if (!foundBlog)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'blogId',
        message: 'Blog not found',
      });
    return foundBlog;
  }

  private async findPostById(postId: string): Promise<Post> {
    const foundPost = await this.postsRepository.findPostsById(Number(postId));
    if (!foundPost.foundPost)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'postId',
        message: 'Post not found',
      });
    return foundPost.foundPost;
  }
}
