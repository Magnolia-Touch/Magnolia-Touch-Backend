// dto/update-tracking.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateTrackingDto {
    @IsOptional()
    @IsString()
    tracking_details?: string;
}
