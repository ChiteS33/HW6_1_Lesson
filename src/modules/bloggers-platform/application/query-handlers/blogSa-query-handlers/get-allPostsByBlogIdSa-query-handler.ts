import { InputQueryPaginationTypeWithSearchName } from '../../../../../core/pagination/inputQueryPaginationTypeWithSearchName';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostsQueryRepository } from '../../../repositories/postsRepositories/posts.queryRepository';
import { paginationValuesMakerMapper } from '../../../../../core/mappers/paginationValuesMakerMapper';
import { PostViewWithLikesType } from '../../../api/view-types/posts/postViewWithLikes.type';
import { postViewMapperWithNewestLikes } from '../../../mappers/post/postViewMapperWithNewestLikes';
import { PostWithBlogName } from '../../../domain/entities/posts.entity';
import { PostsRepository } from '../../../repositories/postsRepositories/posts.repository';
import { Blog } from '../../../domain/entities/blogs.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BlogsRepository } from '../../../repositories/blogsRepositories/blogs.repository';
import { viewMapperWithPagination } from '../../../../quiz-game/aplication/query-handler/quizQuestions-query-handlers/get-allQuizQuestions-query-handler';
import { paginationValuesForRepo } from '../../../../../core/types/paginationValueForRepo.type';

export class GetAllPostsByBlogIdSaQuery {
  constructor(
    public blogId: string,
    public query: InputQueryPaginationTypeWithSearchName,
  ) {}
}

@QueryHandler(GetAllPostsByBlogIdSaQuery)
export class GetAllPostsByBlogIdSaQueryHandler implements IQueryHandler<GetAllPostsByBlogIdSaQuery> {
  constructor(
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @Inject(PostsRepository) private postsRepository: PostsRepository,
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}
  async execute(query: GetAllPostsByBlogIdSaQuery): Promise<any> {
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

    const foundStatuses = [];

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

    return viewMapperWithPagination(postViews, params);
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

export const paginationViewMapper = (
  paginationValues: paginationValuesForRepo,
  totalCount: number,
) => {
  return {
    pagesCount: Math.ceil(totalCount / paginationValues.pageSize),
    page: paginationValues.pageNumber,
    pageSize: paginationValues.pageSize,
    totalCount: totalCount,
  };
};
