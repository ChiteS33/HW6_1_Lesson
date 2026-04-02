import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

// export type CommentDocument = HydratedDocument<CommentModel>;

export class ContentInputDto {
  @IsStringWithTrim(20, 300)
  content: string;
}

// @Schema()
// export class CommentatorInfo {
//   @Prop({ type: String, required: true }) userId: string;
//   @Prop({ type: String, required: true }) userLogin: string;
// }
//
// @Schema()
// export class LikesInfo {
//   @Prop({ type: String, default: 0 }) likesCount: number;
//   @Prop({ type: String, default: 0 }) dislikesCount: number;
//   @Prop({ enum: LikeDislikeStatus }) myStatus: LikeDislikeStatus;
// }
//
// @Schema({ versionKey: false })
// export class CommentModel {
//   constructor() {}
//   @Prop({ type: String, required: true }) content: string;
//   @Prop({ type: String, required: true }) postId: string;
//   @Prop({ type: CommentatorInfo, _id: false, required: true })
//   commentatorInfo: CommentatorInfo;
//   @Prop({ type: Date, required: true }) createdAt: Date;
//
//   public static createComment(
//     inputDto: InputDtoForCreateComment,
//   ): CommentModel {
//     const commentInfo = {
//       userId: inputDto.userId,
//       userLogin: inputDto.userLogin,
//     };
//     const newComment = new CommentModel();
//     newComment.content = inputDto.content;
//     newComment.postId = inputDto.postId;
//     newComment.commentatorInfo = commentInfo;
//     newComment.createdAt = new Date();
//
//     return newComment;
//   }
//
//   updateComment(inputDto: string) {
//     this.content = inputDto;
//     return;
//   }
// }
//
// export const CommentSchema = SchemaFactory.createForClass(CommentModel);
// CommentSchema.loadClass(CommentModel);
// export interface CommentModelI extends Model<CommentDocument> {
//   createComment(inputDto: InputDtoForCreateComment): CommentModel;
// }
