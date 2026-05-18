import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortDirection } from '../../../../../core/types/enumSortDirection.type';
import { PublishedStatus } from '../../../../../core/types/enumPublished.type';

export class QuestionInputQueryDto {
  @IsOptional()
  @IsString()
  bodySearchTerm: string;
  @IsOptional()
  @IsEnum(PublishedStatus)
  publishedStatus: string;
  @IsOptional()
  @IsString()
  sortBy: string;
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection: string;
  @IsOptional()
  @IsString()
  pageNumber: string;
  @IsOptional()
  @IsString()
  pageSize: string;
}
