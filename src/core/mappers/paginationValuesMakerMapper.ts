import { InputQueryPaginationTypeWithSearchName } from '../pagination/inputQueryPaginationTypeWithSearchName';
import { SortDirection } from '../types/enumSortDirection.type';
import { paginationValuesForRepo } from '../types/paginationValueForRepo.type';

export const paginationValuesMakerMapper = (
  pagination: InputQueryPaginationTypeWithSearchName,
): paginationValuesForRepo => {
  return {
    pageNumber: pagination.pageNumber ? Number(pagination.pageNumber) : 1,
    pageSize: pagination.pageSize ? Number(pagination.pageSize) : 10,
    sortBy: pagination.sortBy ? pagination.sortBy : 'createdAt',
    sortDirection: pagination.sortDirection
      ? pagination.sortDirection
      : SortDirection.DESC,
  };
};
