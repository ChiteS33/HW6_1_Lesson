import { SortDirection } from './enumSortDirection.type';

export type paginationValuesForRepo = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
};
