import { Body, Controller, Get, Query, Request, UseGuards, Post, Req } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateBookingDto } from "./dto/booking.dto";
import { BookingService } from "./booking.service";
import { BookingQueryDto } from "./dto/booking-query.dto";


@Controller('booking')
export class BookingController{
    constructor(private bookingService: BookingService) {}

    @UseGuards(JwtAuthGuard)
    @Post("book-cleaning-service")
    async createbooking(
        @Req() req,
        @Body() body: CreateBookingDto,
        @Query() query: BookingQueryDto
    ){

        const userId = req.user.customer_id
        console.log(userId)
        return this.bookingService.createBooking(
            {
                ...body
            },
            userId, query.church_id, query.subscription_id, query.flower_id
        )
    }
}
