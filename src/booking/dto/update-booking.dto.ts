import { IsEnum } from "class-validator";
import { CleaningStatus } from "@prisma/client";

export class UpdateBookingstatusDto {

    @IsEnum(CleaningStatus)
    status: CleaningStatus;

}