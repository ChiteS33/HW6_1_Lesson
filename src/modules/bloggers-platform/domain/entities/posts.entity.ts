import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Blog } from './blogs.entity';
import { LikeForPost } from './likesForPosts.entity';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';
import { Comment } from './comments.entity';

export class PostInputDtoValidation {
  @IsNotEmpty()
  @IsStringWithTrim(1, 30)
  title: string;
  @IsNotEmpty()
  @IsStringWithTrim(1, 100)
  shortDescription: string;
  @IsNotEmpty()
  @IsStringWithTrim(1, 1000)
  content: string;
}

export class PostInputDtoValidationForCreate {
  @IsNotEmpty()
  @IsStringWithTrim(1, 30)
  title: string;
  @IsNotEmpty()
  @IsStringWithTrim(1, 100)
  shortDescription: string;
  @IsNotEmpty()
  @IsStringWithTrim(1, 1000)
  content: string;
  @IsNotEmpty()
  @IsStringWithTrim(1, 100)
  blogId: string;
}

@Entity({ name: 'Posts' })
export class Post extends BaseDbEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'integer' })
  blogId: number;

  @ManyToOne(() => Blog, (blog) => blog.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @OneToMany(() => LikeForPost, (like) => like.post)
  likes: LikeForPost[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  public static createPost(dto: {
    title: string;
    shortDescription: string;
    content: string;
    blogId: number;
  }): Post {
    const newPost = new Post();
    newPost.title = dto.title;
    newPost.shortDescription = dto.shortDescription;
    newPost.content = dto.content;
    newPost.blogId = dto.blogId;
    return newPost;
  }

  updatePost(dto: {
    title: string;
    shortDescription: string;
    content: string;
  }) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }
}
export class PostWithBlogName extends Post {
  blogName: string;
}
