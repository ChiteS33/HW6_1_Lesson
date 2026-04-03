import { PaginationWithSearchLoginTermAndSearchEMailTermForRepo } from '../types/PaginationWithSearchLoginTermAndSearchEMailTermForRepo.type';
import { SortDirection } from '../types/enumSortDirection.type';
import { InPutPaginationWithSearchLoginTermAndSearchEMailTerm } from '../types/inputPaginationDtoWithSearchTerms.type';

export const paginationValuesMakerWithSearchLoginAndEmailMapper = (
  query: InPutPaginationWithSearchLoginTermAndSearchEMailTerm,
): PaginationWithSearchLoginTermAndSearchEMailTermForRepo => {
  return {
    sortBy: query.sortBy ?? 'createdAt',
    sortDirection: query.sortDirection ?? SortDirection.DESC,
    pageNumber: query.pageNumber ? Number(query.pageNumber) : 1,
    pageSize: query.pageSize ? Number(query.pageSize) : 10,
    searchLoginTerm: query.searchLoginTerm ?? '',
    searchEmailTerm: query.searchEmailTerm ?? '',
  };
};
