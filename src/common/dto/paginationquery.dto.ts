// dto/pagination-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  limit?: number;
}
