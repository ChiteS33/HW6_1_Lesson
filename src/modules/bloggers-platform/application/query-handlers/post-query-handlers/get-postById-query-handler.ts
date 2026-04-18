import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostsQueryRepository } from '../../../repositories/postsRepositories/posts.queryRepository';
import { PostViewWithLikesType } from '../../../api/view-types/posts/postViewWithLikes.type';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { postViewMapperWithNewestLikes } from '../../../mappers/post/postViewMapperWithNewestLikes';
import { LikesForPostRepository } from '../../../repositories/likesForPostRepositories/post.likes.repository';
import { LikeForPost } from '../../../domain/entities/likesForPosts.entity';
import { LikeDislikeStatus } from '../../../../../core/types/enumLikeOrDislike.type';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { PostWithBlogName } from '../../../domain/entities/posts.entity';

export class FindPostByPostIdQuery {
  constructor(
    public postId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(FindPostByPostIdQuery)
export class GetPostByPostIdQueryHandler implements IQueryHandler<FindPostByPostIdQuery> {
  constructor(
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @Inject(LikesForPostRepository)
    private likesForPostRepository: LikesForPostRepository,
    @Inject(PostsRepository) private postsRepository: PostsRepository,
  ) {}

  async execute(query: FindPostByPostIdQuery): Promise<PostViewWithLikesType> {
    const foundPostEntity: {
      foundPost: PostWithBlogName;
      totalCount: number;
    } = await this.findPostByPostId(query.postId);

    const foundLikes: {
      results: { postId: number; likesCount: string; dislikesCount: string }[];
      newestLikes: {
        addedAt: Date;
        userId: number;
        login: string;
        postId: number;
      }[];
    } = await this.postsRepository.findLikesForPost([Number(query.postId)]);

    let myStatus: { postId: number; status: LikeDislikeStatus } = {
      postId: Number(query.postId),
      status: LikeDislikeStatus.none,
    };

    if (!query.userId) {
      return postViewMapperWithNewestLikes(
        foundPostEntity.foundPost,
        foundLikes.results[0],
        myStatus,
        foundLikes.newestLikes,
      );
    }

    const foundLikeForPost: LikeForPost | null =
      await this.likesForPostRepository.findLikeByUserIdAndPostId(
        Number(query.userId),
        Number(query.postId),
      );
    if (!foundLikeForPost) {
      return postViewMapperWithNewestLikes(
        foundPostEntity.foundPost,
        foundLikes.results[0],
        myStatus,
        foundLikes.newestLikes,
      );
    }

    myStatus = {
      postId: Number(query.postId),
      status: foundLikeForPost.status,
    };
    return postViewMapperWithNewestLikes(
      foundPostEntity.foundPost,
      foundLikes.results[0],
      myStatus,
      foundLikes.newestLikes,
    );
  }

  private async findPostByPostId(postId: string): Promise<{
    foundPost: any;
    totalCount: number;
  }> {
    const { foundPost, totalCount } = await this.postsRepository.findPostsById(
      Number(postId),
    );

    if (!foundPost)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'postId',
        message: 'Post not found',
      });
    return {
      foundPost,
      totalCount,
    };
  }
}
