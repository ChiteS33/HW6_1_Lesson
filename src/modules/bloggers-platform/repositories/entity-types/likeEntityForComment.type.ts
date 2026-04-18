import { LikeDislikeStatus } from '../../../../core/types/enumLikeOrDislike.type';

export type LikeEntityForCommentType = {
  id: number;
  userId: number;
  login: string;
  commentId: number;
  status: LikeDislikeStatus;
  createdAt: Date;
};

export type LikeEntityForCommentWithLikeStatusType = {
  id: number;
  userId: number;
  login: string;
  commentId: number;
  status: LikeDislikeStatus;
  createdAt: Date;
};
