import { InputQueryPaginationTypeWithSearchName } from '../../../../../core/pagination/inputQueryPaginationTypeWithSearchName';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostsQueryRepository } from '../../../repositories/postsRepositories/posts.queryRepository';
import {
  paginationValuesForRepo,
  paginationValuesMakerMapper,
} from '../../../../../core/mappers/paginationValuesMakerMapper';
import { postViewWithPagination } from '../../../mappers/post/postViewMapperWithPagination';
import { PostWithBlogName } from '../../../domain/entities/posts.entity';
import { PostViewWithLikesType } from '../../../api/view-types/posts/postViewWithLikes.type';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { postViewMapperWithNewestLikes } from '../../../mappers/post/postViewMapperWithNewestLikes';
import { paginationViewMapper } from '../blogSa-query-handlers/get-allPostsByBlogIdSa-query-handler';

export class GetAllPostsQuery {
  constructor(
    public query: InputQueryPaginationTypeWithSearchName,
    public userId?: string,
  ) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<GetAllPostsQuery> {
  constructor(
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @Inject(PostsRepository) private postsRepository: PostsRepository,
  ) {}
  async execute(query: GetAllPostsQuery): Promise<any> {
    const paginationValues: paginationValuesForRepo =
      paginationValuesMakerMapper(query.query);

    const foundAllPosts: {
      foundPosts: PostWithBlogName[];
      totalCount: number;
    } = await this.postsQueryRepository.findAllPosts(paginationValues);

    const idsArray: number[] = foundAllPosts.foundPosts.map((post) => post.id);

    const foundLikes: {
      results: { postId: number; likesCount: string; dislikesCount: string }[];
      newestLikes: {
        addedAt: Date;
        userId: number;
        login: string;
        postId: number;
      }[];
    } = await this.postsRepository.findLikesForPost(idsArray);

    const foundStatuses: { postId: number; status: string }[] = query.userId
      ? await this.postsRepository.foundLikeStatus(
          idsArray,
          Number(query.userId),
        )
      : [];

    const postViews: PostViewWithLikesType[] = foundAllPosts.foundPosts.map(
      (foundPost: PostWithBlogName) => {
        const likesAndDislikesCount = foundLikes.results.find(
          (likeElement: {
            postId: number;
            likesCount: string;
            dislikesCount: string;
          }) => likeElement.postId === foundPost.id,
        );
        const status = foundStatuses.find(
          (status: { postId: number; status: string }) =>
            status.postId === foundPost.id,
        );

        const newestLikes = foundLikes.newestLikes.filter(
          (newestLike: {
            addedAt: Date;
            userId: number;
            login: string;
            postId: number;
          }) => newestLike.postId === foundPost.id,
        );

        return postViewMapperWithNewestLikes(
          foundPost,
          likesAndDislikesCount!,
          status!,
          newestLikes,
        );
      },
    );

    const params = paginationViewMapper(
      paginationValues,
      foundAllPosts.totalCount,
    );

    return postViewWithPagination(postViews, params);
  }
}
