import { IsEnum } from 'class-validator';
import { LikeDislikeStatus } from '../../../core/types/enumLikeOrDislike.type';

export class InPutLikeStatusValidation {
  @IsEnum(LikeDislikeStatus)
  likeStatus: LikeDislikeStatus;
}
