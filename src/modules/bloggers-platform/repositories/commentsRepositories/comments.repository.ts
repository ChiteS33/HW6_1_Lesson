import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/entities/comments.entity';
import { LikesForComment } from '../../domain/entities/likesForComments.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(LikesForComment)
    private likeRepository: Repository<LikesForComment>,
  ) {}

  async save(comment: Comment): Promise<string> {
    const createdComment = await this.commentRepository.save(comment);
    return createdComment.id.toString();
  }

  async findCommentById(commentId: number): Promise<Comment | null> {
    const foundComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    return foundComment ?? null;
  }

  async findLikeStatus(
    commentIds: number[],
    userId: number,
  ): Promise<{ commentId: number; status: string }[]> {
    return this.likeRepository
      .createQueryBuilder('lfc')
      .select(['lfc."commentId" as "commentId"', 'lfc.status as "status"'])
      .where('lfc."commentId" IN (:...commentIds)', { commentIds })
      .andWhere('lfc."userId" = :userId', { userId })
      .getRawMany();
  }

  async findCounters(commentIds: number[]) {
    if (!commentIds[0]) return [];
    return this.likeRepository
      .createQueryBuilder('l')
      .select([
        'l."commentId" as "commentId"',
        'COUNT(CASE WHEN l.status = \'Like\' THEN 1 END) as "likesCount"',
        'COUNT(CASE WHEN l.status = \'Dislike\' THEN 1 END) as "dislikesCount"',
      ])
      .where('l.commentId IN  (:...commentIds)', { commentIds })
      .groupBy('l.commentId')
      .getRawMany<{
        commentId: number;
        likesCount: number;
        dislikesCount: number;
      }>();
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.commentRepository.softDelete(commentId);
    return;
  }
}
