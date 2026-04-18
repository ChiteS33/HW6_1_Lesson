import { CommentViewType } from '../../api/view-types/comments/commentView.type';

import { LikeDislikeStatus } from '../../../../core/types/enumLikeOrDislike.type';
import { Comment } from '../../domain/entities/comments.entity';

export const commentsViewMapperWithCount = (
  comment: Comment,
  likesOrDislikesCounters: {
    commentId: number;
    likesCount: number;
    dislikesCount: number;
  },
  status: { commentId: number; status: string },
): CommentViewType => {
  return {
    id: comment.id.toString(),
    content: comment.content,
    commentatorInfo: {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: likesOrDislikesCounters
        ? Number(likesOrDislikesCounters?.likesCount)
        : 0,
      dislikesCount: likesOrDislikesCounters
        ? Number(likesOrDislikesCounters?.dislikesCount)
        : 0,
      myStatus: (status?.status as LikeDislikeStatus) ?? LikeDislikeStatus.none,
    },
  };
};
