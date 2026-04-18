import { PaginationViewType } from '../../../../core/types/paginationViewType';
import { FinalViewWithPaginationType } from '../../../../core/types/finalViewWithPagination.type';
import { CommentViewType } from '../../api/view-types/comments/commentView.type';

export const commentsViewMapperWithPagination = (
  comment: CommentViewType[],
  pagination: PaginationViewType,
): FinalViewWithPaginationType<CommentViewType> => {
  return {
    pagesCount: pagination.pagesCount,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalCount: pagination.totalCount,
    items: comment,
  };
};
