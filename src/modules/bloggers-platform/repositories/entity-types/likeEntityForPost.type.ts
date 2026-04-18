import { LikeDislikeStatus } from '../../../../core/types/enumLikeOrDislike.type';

export type LikeEntityForPostType = {
  id: number;
  userId: number;
  login: string;
  postId: number;
  status: LikeDislikeStatus;
  createdAt: Date;
};
