import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../domain/entities/posts.entity';
import { LikeForPost } from '../../domain/entities/likesForPosts.entity';
import { LikeDislikeStatus } from '../../../../core/types/enumLikeOrDislike.type';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(LikeForPost)
    private likesRepository: Repository<LikeForPost>,
  ) {}

  async save(post: Post): Promise<string> {
    const createdPost = await this.postsRepository.save(post);
    return createdPost.id.toString();
  }

  async findPostsById(postId: number): Promise<{
    foundPost: Post | null;
    totalCount: number;
  }> {
    const foundPost: Post | null = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['blog'],
    });

    const totalCount = await this.postsRepository.count({
      where: { id: postId },
    });

    return {
      foundPost,
      totalCount,
    };
  }

  async deletePostById(postId: number): Promise<void> {
    await this.postsRepository.softDelete(postId);
  }

  async foundLikeStatus(
    postIds: number[],
    userId: number,
  ): Promise<{ postId: number; status: string }[]> {
    return this.likesRepository
      .createQueryBuilder('lfp')
      .select(['lfp.postId as "postId"', 'lfp.status as "status"'])
      .where('lfp.postId IN (:...postIds)', { postIds })
      .andWhere('lfp.userId = :userId', { userId })
      .andWhere('lfp.deletedAt IS NULL')
      .getRawMany();
  }

  async findLikesForPost(postIds: number[]): Promise<{
    results: { postId: number; likesCount: string; dislikesCount: string }[];
    newestLikes: {
      addedAt: Date;
      userId: number;
      login: string;
      postId: number;
    }[];
  }> {
    const results = await this.likesRepository
      .createQueryBuilder('like')
      .select([
        'like.postId as "postId"',
        'COUNT(CASE WHEN like.status = \'Like\' THEN 1 END) as "likesCount"',
        'COUNT(CASE WHEN like.status = \'Dislike\' THEN 1 END) as "dislikesCount"',
      ])
      .where('like.postId IN (:...postIds)', { postIds })
      .groupBy('like.postId')
      .getRawMany<{
        postId: number;
        likesCount: string;
        dislikesCount: string;
      }>();

    const newestLikes: {
      likeId: number;
      rn: string;
      postId: number;
      login: string;
      userId: number;
      addedAt: Date;
    }[] = await this.likesRepository
      .createQueryBuilder('likes')
      .leftJoin(
        (subQuery) => {
          return subQuery
            .from('LikesForPosts', 'likes')
            .select('likes.id', 'likeId')
            .addSelect(
              'ROW_NUMBER() OVER (PARTITION BY likes.postId ORDER BY likes.createdAt DESC) as rn',
            )
            .where('likes."postId" IN (:...postIds)', { postIds })
            .andWhere('likes."status" = :likeStatus', {
              likeStatus: LikeDislikeStatus.like,
            });
        },
        'likes_with_rn',
        '"likes".id = likes_with_rn."likeId"',
      )
      .select([
        'likes.postId as "postId"',
        'likes.login as login',
        'likes."userId" as "userId"',
        'likes.createdAt as "addedAt"',
      ])
      .addSelect('likes_with_rn', 'likes_with_rn')
      .where('likes_with_rn.rn <= 3')
      .orderBy('likes.createdAt', 'DESC')
      .getRawMany();

    return { results, newestLikes };
  }
}
