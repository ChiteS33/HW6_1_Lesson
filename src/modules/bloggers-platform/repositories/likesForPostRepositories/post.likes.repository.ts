import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeForPost } from '../../domain/entities/likesForPosts.entity';

@Injectable()
export class LikesForPostRepository {
  constructor(
    @InjectRepository(LikeForPost)
    private likesRepository: Repository<LikeForPost>,
  ) {}

  async save(likesForPost: LikeForPost): Promise<string> {
    const createdLike = await this.likesRepository.save(likesForPost);
    return createdLike.id.toString();
  }

  async findLikeByUserIdAndPostId(
    userId: number,
    postId: number,
  ): Promise<LikeForPost | null> {
    const foundPostLike = await this.likesRepository.findOne({
      where: { userId: userId, postId: postId },
    });
    return foundPostLike ?? null;
  }
}
