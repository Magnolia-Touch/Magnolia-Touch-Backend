import { Body, Controller, Get, Query, Request, UseGuards, Post, Req, ParseIntPipe, Patch, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateBookingDto } from "./dto/booking.dto";
import { BookingService } from "./booking.service";
import { BookingQueryDto } from "./dto/booking-query.dto";
import { UpdateBookingstatusDto } from "./dto/update-booking.dto";


@Controller('booking')
export class BookingController {
    constructor(private bookingService: BookingService) { }

    @UseGuards(JwtAuthGuard)
    @Post("book-cleaning-service")
    async createbooking(
        @Req() req,
        @Body() body: CreateBookingDto,
    ) {
        const userId = req.user.customer_id;
        const userEmail = req.user.email;
        return this.bookingService.createBooking(
            {
                ...body
            },
            userId, userEmail
        )
    }

    @Patch(":id/status")
    updateStatus(@Param('id') id: string, @Body() updatecleaningstatus: UpdateBookingstatusDto) {
        return this.bookingService.updateStaus(+id, updatecleaningstatus)
    }
}
