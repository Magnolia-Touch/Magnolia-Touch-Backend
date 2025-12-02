// booking/dto/update-booking-status.dto.ts
import { IsEnum } from 'class-validator';

export enum CleaningStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateBookingStatusDto {
  @IsEnum(CleaningStatusEnum, {
    message: 'Status must be one of PENDING, IN_PROGRESS, COMPLETED, CANCELLED',
  })
  status: CleaningStatusEnum;
}
