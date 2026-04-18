import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesForComment } from '../../domain/entities/likesForComments.entity';

@Injectable()
export class LikesForCommentRepository {
  constructor(
    @InjectRepository(LikesForComment)
    private likeRepository: Repository<LikesForComment>,
  ) {}

  async save(like: LikesForComment): Promise<string> {
    const createdLike = await this.likeRepository.save(like);
    return createdLike.id.toString();
  }

  async findLikeByUserIdAndCommentId(
    userId: number,
    commentId: number,
  ): Promise<LikesForComment | null> {
    return this.likeRepository.findOne({
      where: {
        userId: userId,
        commentId: commentId,
      },
    });
  }

  async deleteLikesForComment(commentId: number): Promise<void> {
    await this.likeRepository.softDelete(commentId);
    return;
  }
}
