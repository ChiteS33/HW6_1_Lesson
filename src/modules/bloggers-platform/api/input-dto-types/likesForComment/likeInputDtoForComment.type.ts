import { ObjectId } from 'mongodb';
import { LikeDislikeStatus } from '../../../domain/entities/posts.entity';

export type InputLikeDTOForComment = {
  commentId: string;
  likeStatus: LikeDislikeStatus;
  user: {
    _id: ObjectId;
    login: string;
    email: string;
    password: string;
    createdAt: Date;
    emailConfirmation: any;
    recoveryData: any;
  };
};
