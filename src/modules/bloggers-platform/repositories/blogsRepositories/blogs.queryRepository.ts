import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InputQueryPaginationTypeWithSearchName } from '../../../../core/pagination/inputQueryPaginationTypeWithSearchName';
import { paginationValuesMakerWithSearchNameTermMapper } from '../../../../core/mappers/paginationValuesMakerWithSearchNameTermMapper';
import { TotalCount } from '../../../../core/types/totalCount.type';
import { blogViewMapper } from '../../mappers/blog/blogViewMapper';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { blogViewMapperWithPagination } from '../../mappers/blog/blogViewMapperWithPagination';
import { PaginationViewType } from '../../../../core/types/paginationViewType';
import { BlogViewType } from '../../api/view-types/blogs/blogView.type';
import { FinalViewWithPaginationType } from '../../../../core/types/finalViewWithPagination.type';
import { BlogEntityType } from '../entity-types/blogEntity.type';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async getAllBlogs(
    query: InputQueryPaginationTypeWithSearchName,
  ): Promise<FinalViewWithPaginationType<BlogViewType>> {
    const paginationValues =
      paginationValuesMakerWithSearchNameTermMapper(query);
    const skip = (paginationValues.pageNumber - 1) * paginationValues.pageSize;
    const limit = paginationValues.pageSize;
    const allowedSortFields = [
      'id',
      'name',
      'description',
      'websiteUrl',
      'createdAt',
      'isMembership',
    ];
    const allowedDirections = ['ASC', 'DESC'];
    const safeSortBy = allowedSortFields.includes(paginationValues.sortBy)
      ? paginationValues.sortBy
      : 'createdAt';
    const safeSortDirection = allowedDirections.includes(
      paginationValues.sortDirection.toUpperCase(),
    )
      ? paginationValues.sortDirection.toUpperCase()
      : 'DESC';

    const foundBlogs: BlogEntityType[] = await this.datasource.query(
      `SELECT * 
    FROM "Blogs" 
    WHERE "name" ILIKE $1 
    ORDER BY "${safeSortBy}" ${safeSortDirection}
    LIMIT $2 OFFSET $3`,
      [`%${paginationValues.searchNameTerm}%`, limit, skip],
    );

    const totalCount: TotalCount[] = await this.datasource.query(
      `SELECT COUNT(*) :: int as count
      FROM "Blogs"
      WHERE "name" ILIKE $1`,
      [`%${paginationValues.searchNameTerm}%`],
    );
    const params: PaginationViewType = {
      pagesCount: Math.ceil(totalCount[0].count / limit),
      page: paginationValues.pageNumber,
      pageSize: limit,
      totalCount: totalCount[0].count,
    };

    return blogViewMapperWithPagination(foundBlogs.map(blogViewMapper), params);
  }

  async getBlogById(blogId: string): Promise<BlogViewType> {
    const foundBlog: BlogEntityType[] = await this.datasource.query(
      `SELECT * 
      FROM "Blogs" WHERE id = $1`,
      [blogId],
    );

    if (!foundBlog[0]) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'blogId',
        message: 'Blog not found',
      });
    }

    return blogViewMapper(foundBlog[0]);
  }
}
