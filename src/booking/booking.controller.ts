import { Body, Controller, Get, Query, Request, UseGuards, Post, Req, ParseIntPipe } from "@nestjs/common";
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
        @Query('church_id', ParseIntPipe) church_id: number, 
        @Query('subscription_id', ParseIntPipe) subscription_id: number, 
        @Query('flower_id', ParseIntPipe) flower_id: number
    ){

        const userId = req.user.customer_id;
        const userEmail = req.user.email;
        return this.bookingService.createBooking(
            {
                ...body
            },
            userId, church_id, subscription_id, flower_id, userEmail
        )
    }
}
