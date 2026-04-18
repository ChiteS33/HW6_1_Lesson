import { Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Column, Entity, OneToMany } from 'typeorm';
import { Post } from './posts.entity';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';

export class BlogInputDto {
  @IsStringWithTrim(1, 15)
  name: string;
  @IsStringWithTrim(1, 500)
  description: string;
  @IsStringWithTrim(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}

@Entity({ name: 'Blogs' })
export class Blog extends BaseDbEntity {
  @Column({ type: 'varchar', collation: 'C' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  websiteUrl: string;

  @Column({ type: 'boolean' })
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  public static createBlog(dto: BlogInputDto): Blog {
    const newBlog = new Blog();
    newBlog.name = dto.name;
    newBlog.description = dto.description;
    newBlog.websiteUrl = dto.websiteUrl;
    newBlog.isMembership = false;
    return newBlog;
  }

  updateBlog(dto: BlogInputDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    return;
  }
}
