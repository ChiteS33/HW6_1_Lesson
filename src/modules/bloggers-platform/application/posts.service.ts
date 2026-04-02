import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { PostsRepository } from '../repositories/postsRepositories/posts.repository';
import { PostEntityWithLikeCounterType } from '../repositories/entity-types/postEntity.type';

@Injectable()
export class PostService {
  constructor(
    @Inject(PostsRepository) private postsRepository: PostsRepository,
  ) {}

  async findPostById(postId: string): Promise<PostEntityWithLikeCounterType> {
    const foundedPost: PostEntityWithLikeCounterType =
      await this.postsRepository.findPostsById(postId);
    if (!foundedPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'postId',
        message: 'Post not found.',
      });
    }
    return foundedPost;
  }

  // async findPostByIdForMongo(postId: string): Promise<PostDocument> {
  //   const foundedPost =
  //     await this.postsRepository.findPostsByIdForMongo(postId);
  //   if (!foundedPost) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       field: 'postId',
  //       message: 'Post not found.',
  //     });
  //   }
  //   return foundedPost;
  // }
}
