import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../../user-accounts/domain/entities/users.entity';
import { LikeDislikeStatus } from '../../../../core/types/enumLikeOrDislike.type';
import { Post } from './posts.entity';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';

@Entity({ name: 'LikesForPosts' })
export class LikeForPost extends BaseDbEntity {
  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  postId: number;

  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'enum', enum: LikeDislikeStatus })
  status: LikeDislikeStatus;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  public static createLikeForPost(
    postId: number,
    likeStatus: LikeDislikeStatus,
    user: User,
  ): LikeForPost {
    const newLike = new LikeForPost();
    newLike.userId = user.id;
    newLike.postId = postId;
    newLike.login = user.login;
    newLike.status = likeStatus;
    return newLike;
  }

  updateLikeForPost(likeStatus: LikeDislikeStatus) {
    this.status = likeStatus;
    return;
  }
}
