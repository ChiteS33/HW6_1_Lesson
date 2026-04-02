import { HydratedDocument } from 'mongoose';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { IsNotEmpty } from 'class-validator';

// export type PostDocument = HydratedDocument<PostModel>;
export type PostInputDtoType = {
  title: string;
  shortDescription: string;
  content: string;
};

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

export enum LikeDislikeStatus {
  none = 'None',
  like = 'Like',
  dislike = 'Dislike',
}

// @Schema()
// export class NewestLikesInfo {
//   @Prop({ type: Date, default: null }) addedAt: Date | null;
//   @Prop({ type: String, default: null }) userId: string | null;
//   @Prop({ type: String, default: null }) login: string | null;
// }
//
// @Schema()
// export class ExtendedLikesInfo {
//   @Prop({ type: Number, default: 0 }) likesCount: number;
//   @Prop({ type: Number, default: 0 }) dislikesCount: number;
//   @Prop({ type: [NewestLikesInfo], default: [] })
//   newestLikes: NewestLikesInfo[];
// }
//
// @Schema({ versionKey: false })
// export class PostModel {
//   constructor() {}
//   @Prop({ type: String, required: true }) title: string;
//   @Prop({ type: String, required: true }) shortDescription: string;
//   @Prop({ type: String, required: true }) content: string;
//   @Prop({ type: String, required: true }) blogId: string;
//   @Prop({ type: String, required: true }) blogName: string;
//   @Prop({ type: Date, required: true }) createdAt: Date;
//
//   public static createPost(
//     dto: PostInputDtoValidationForCreate,
//     blogName: string,
//   ): PostModel {
//     const newPost = new PostModel();
//     newPost.title = dto.title;
//     newPost.shortDescription = dto.shortDescription;
//     newPost.content = dto.content;
//     newPost.blogId = dto.blogId;
//     newPost.blogName = blogName;
//     newPost.createdAt = new Date();
//
//     return newPost;
//   }
//
//   updatePost(postInputDto: PostInputDtoValidationForCreate) {
//     this.title = postInputDto.title;
//     this.shortDescription = postInputDto.shortDescription;
//     this.content = postInputDto.content;
//     this.blogId = postInputDto.blogId!;
//   }
// }
//
// export const PostSchema = SchemaFactory.createForClass(PostModel);
// PostSchema.loadClass(PostModel);
// export interface PostModelI extends Model<PostDocument> {
//   createPost(dto: PostInputDtoValidation, blogName: string): PostModel;
// }
