import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';
import { Post } from './posts.entity';
import { LikesForComment } from './likesForComments.entity';

export class ContentInputDto {
  @IsStringWithTrim(20, 300)
  content: string;
}

@Entity({ name: 'Comments' })
export class Comment extends BaseDbEntity {
  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'integer' })
  postId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'varchar' })
  userLogin: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @OneToMany(() => LikesForComment, (like) => like.comment)
  likes: LikesForComment[];

  public static createComment(
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
  ): Comment {
    const newComment = new Comment();
    newComment.content = content;
    newComment.postId = Number(postId);
    newComment.userId = Number(userId);
    newComment.userLogin = userLogin;
    return newComment;
  }

  updateComment(content: string) {
    this.content = content;
    return;
  }
}
