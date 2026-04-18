import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Comment } from '../../../domain/entities/comments.entity';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: number,
    public userLogin: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(CommentsRepository) private commentsRepository: CommentsRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<string> {
    await this.findPost(command.postId);
    const newComment = Comment.createComment(
      command.content,
      command.postId,
      command.userId.toString(),
      command.userLogin,
    );
    return this.commentsRepository.save(newComment);
  }

  private async findPost(postId: string) {
    const foundPost = await this.postsRepository.findPostsById(Number(postId));
    if (!foundPost.foundPost)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'PostId',
        message: 'Post not found',
      });
    return foundPost;
  }
}
