import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostService } from '../../posts.service';
import { CommentsRepository } from '../../../repositories/commentsRepositories/comments.repository';
import { CommentsQueryRepository } from '../../../repositories/commentsRepositories/comments.queryRepository';
import { CommentViewType } from '../../../api/view-types/comments/commentView.type';
import { LikeDislikeStatus } from '../../../domain/entities/posts.entity';
import { commentsViewMapperWithCount } from '../../../mappers/comment/commentsViewMapperWithCount';
import { CommentEntityWithLikeCounterType } from '../../../repositories/entity-types/commentEntityWithLikeStatus.type';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @Inject(PostService) private postService: PostService,
    @Inject(CommentsRepository) private commentsRepository: CommentsRepository,
    @Inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentViewType> {
    await this.postService.findPostById(command.postId);
    const createdCommentId: string =
      await this.commentsRepository.createComment(
        command.postId,
        command.content,
        command.userId,
        command.userLogin,
      );
    const foundComment: CommentEntityWithLikeCounterType =
      await this.commentsQueryRepository.findCommentById(
        createdCommentId,
        command.userId,
      );

    return commentsViewMapperWithCount(foundComment, LikeDislikeStatus.none);
  }
}
