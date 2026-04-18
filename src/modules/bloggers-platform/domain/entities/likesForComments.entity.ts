import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';
import { LikeDislikeStatus } from '../../../../core/types/enumLikeOrDislike.type';
import { User } from '../../../user-accounts/domain/entities/users.entity';
import { Comment } from './comments.entity';

@Entity({ name: 'LikesForComments' })
export class LikesForComment extends BaseDbEntity {
  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  commentId: number;

  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'varchar' })
  status: string;

  @ManyToOne(() => Comment, (comment) => comment.likes)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  public static createLikeForComment(
    commentId: number,
    likeStatus: LikeDislikeStatus,
    user: User,
  ) {
    const newLikeForComment = new LikesForComment();
    newLikeForComment.userId = user.id;
    newLikeForComment.commentId = commentId;
    newLikeForComment.login = user.login;
    newLikeForComment.status = likeStatus;
    return newLikeForComment;
  }

  updateLikeForComment(likeStatus: LikeDislikeStatus) {
    this.status = likeStatus;
    return;
  }
}
