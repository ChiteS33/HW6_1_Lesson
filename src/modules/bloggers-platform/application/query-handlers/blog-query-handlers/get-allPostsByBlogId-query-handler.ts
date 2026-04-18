import { InputQueryPaginationTypeWithSearchName } from '../../../../../core/pagination/inputQueryPaginationTypeWithSearchName';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostsQueryRepository } from '../../../repositories/postsRepositories/posts.queryRepository';
import {
  paginationValuesForRepo,
  paginationValuesMakerMapper,
} from '../../../../../core/mappers/paginationValuesMakerMapper';
import { postViewMapperWithNewestLikes } from '../../../mappers/post/postViewMapperWithNewestLikes';
import { PostViewWithLikesType } from '../../../api/view-types/posts/postViewWithLikes.type';
import { postViewWithPagination } from '../../../mappers/post/postViewMapperWithPagination';
import { PostWithBlogName } from '../../../domain/entities/posts.entity';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { paginationViewMapper } from '../blogSa-query-handlers/get-allPostsByBlogIdSa-query-handler';
import { Blog } from '../../../domain/entities/blogs.entity';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { FinalViewWithPaginationType } from '../../../../../core/types/finalViewWithPagination.type';

export class GetAllPostsByBlogIdQuery {
  constructor(
    public blogId: string,
    public query: InputQueryPaginationTypeWithSearchName,
    public userId: string,
  ) {}
}

@QueryHandler(GetAllPostsByBlogIdQuery)
export class GetAllPostsByBlogIdQueryHandler implements IQueryHandler<GetAllPostsByBlogIdQuery> {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,

    @Inject(PostsRepository) private postsRepository: PostsRepository,
  ) {}
  async execute(
    query: GetAllPostsByBlogIdQuery,
  ): Promise<FinalViewWithPaginationType<PostViewWithLikesType>> {
    await this.findBlogById(query.blogId);

    const paginationValues: paginationValuesForRepo =
      paginationValuesMakerMapper(query.query);

    const foundAllPosts: {
      foundPosts: PostWithBlogName[];
      totalCount: number;
    } = await this.postsQueryRepository.findAllPostsByBlogId(
      Number(query.blogId),
      paginationValues,
    );

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
  private async findBlogById(blogId: string): Promise<Blog> {
    const foundBlog = await this.blogsRepository.findBlogByBlogId(
      Number(blogId),
    );
    if (!foundBlog)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'blogId',
        message: 'Blog not found',
      });
    return foundBlog;
  }
}
