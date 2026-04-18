import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Blog } from '../../../domain/entities/blogs.entity';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';

export class DeletePostByBlogIdSaCommand {
  constructor(
    public postId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(DeletePostByBlogIdSaCommand)
export class DeletePostByBlogIdSaUseCase implements ICommandHandler<DeletePostByBlogIdSaCommand> {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @Inject(PostsRepository) private postsRepository: PostsRepository,
  ) {}

  async execute(command: DeletePostByBlogIdSaCommand): Promise<void> {
    await this.findBlogById(command.blogId);
    await this.findPostById(command.postId);
    await this.postsRepository.deletePostById(Number(command.postId));
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
        message: 'Blog not found.',
      });
    return foundBlog;
  }

  private async findPostById(postId: string) {
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
