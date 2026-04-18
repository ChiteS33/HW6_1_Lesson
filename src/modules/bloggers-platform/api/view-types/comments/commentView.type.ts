import { LikeDislikeStatus } from '../../../../../core/types/enumLikeOrDislike.type';

export type CommentViewType = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeDislikeStatus;
  };
};

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};
