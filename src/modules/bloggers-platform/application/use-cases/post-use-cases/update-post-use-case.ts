import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputDtoValidationForCreate } from '../../../domain/entities/posts.entity';
import { PostService } from '../../posts.service';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public postInputDto: PostInputDtoValidationForCreate,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(PostService) private postService: PostService,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    // const foundedPost = await this.postService.findPostByIdForMongo(
    //   command.postId,
    // );
    // foundedPost.updatePost(command.postInputDto);
    // await this.postsRepository.save(foundedPost);
    return;
  }
}
