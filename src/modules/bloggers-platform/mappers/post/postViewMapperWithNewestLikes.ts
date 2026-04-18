import { LikeDislikeStatus } from 'src/core/types/enumLikeOrDislike.type';

import { PostViewWithLikesType } from '../../api/view-types/posts/postViewWithLikes.type';
import { Post, PostWithBlogName } from '../../domain/entities/posts.entity';

export const postViewMapperWithNewestLikes = (
  foundPost: PostWithBlogName | Post,
  likesAndDislikesCount: {
    postId: number;
    likesCount: string;
    dislikesCount: string;
  },
  status: { postId: number; status: string },
  newestLikes: {
    addedAt: Date;
    userId: number;
    login: string;
    postId: number;
  }[],
): PostViewWithLikesType => {
  let blogName: string;

  if (foundPost instanceof PostWithBlogName) {
    blogName = foundPost.blogName;
  } else {
    blogName = foundPost.blog.name;
  }

  return {
    id: foundPost.id.toString(),
    title: foundPost.title,
    shortDescription: foundPost.shortDescription,
    content: foundPost.content,
    blogId: foundPost.blogId.toString(),
    blogName: blogName,
    createdAt: foundPost.createdAt.toISOString(),
    extendedLikesInfo: {
      likesCount: likesAndDislikesCount
        ? Number(likesAndDislikesCount?.likesCount)
        : 0,
      dislikesCount: likesAndDislikesCount
        ? Number(likesAndDislikesCount?.dislikesCount)
        : 0,
      myStatus: (status?.status as LikeDislikeStatus) ?? LikeDislikeStatus.none,
      newestLikes: newestLikes.map((like) => ({
        addedAt: like.addedAt.toISOString(),
        userId: like.userId.toString(),
        login: like.login,
      })),
    },
  };
};
/*
Post {
  id: 2,
  createdAt: 2026-04-16T14:20:26.012Z,
  updatedAt: 2026-04-16T14:20:26.012Z,
  deletedAt: null,
  title: 'post title',
  shortDescription: 'description',
  content: 'new post content',
  blogId: 2,
  blog: Blog {
    id: 2,
    createdAt: 2026-04-16T14:20:25.381Z,
    updatedAt: 2026-04-16T14:20:25.381Z,
    deletedAt: null,
    name: 'new blog',
    description: 'description',
    websiteUrl: 'https://someurl.com',
    isMembership: false,
    posts: undefined
  },
  likes: undefined,
  comments: undefined
}
 */
