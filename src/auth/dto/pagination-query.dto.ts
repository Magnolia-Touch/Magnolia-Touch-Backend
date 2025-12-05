export class PaginationQueryDto {
  page?: number;
  limit?: number;
  search?: string; // search by email or name
  subscriptionName?: string; // filter by booking subscription name
}
