import { Body, Controller, Get, Query, Request, UseGuards, Post, Req, ParseIntPipe, Patch, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateBookingDto } from "./dto/booking.dto";
import { BookingService } from "./booking.service";
import { BookingQueryDto } from "./dto/booking-query.dto";
import { UpdateBookingstatusDto } from "./dto/update-booking.dto";
import { CheckoutSessionLinkDto, BookingWithCheckoutDto, CreateBookingResponseDto } from "./dto/checkout-session-response.dto";


@Controller('booking')
export class BookingController {
    constructor(private bookingService: BookingService) { }

    @UseGuards(JwtAuthGuard)
    @Post("book-cleaning-service")
    async createbooking(
        @Req() req,
        @Body() body: CreateBookingDto & { successUrl?: string; cancelUrl?: string },
    ): Promise<CreateBookingResponseDto> {
        const userId = req.user.customer_id;
        const userEmail = req.user.email;
        const { successUrl, cancelUrl, ...bookingData } = body;
        
        return this.bookingService.createBooking(
            bookingData,
            userId, 
            userEmail,
            successUrl,
            cancelUrl
        )
    }

    @UseGuards(JwtAuthGuard)
    @Get("checkout-links")
    async getUserCheckoutLinks(
        @Req() req,
        @Query('successUrl') successUrl?: string,
        @Query('cancelUrl') cancelUrl?: string,
    ): Promise<CheckoutSessionLinkDto[]> {
        const userId = req.user.customer_id;
        const userEmail = req.user.email;
        
        return this.bookingService.getUserCheckoutLinks(
            userId,
            userEmail,
            successUrl,
            cancelUrl
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/checkout-link")
    async getBookingCheckoutLink(
        @Req() req,
        @Param('id', ParseIntPipe) bookingId: number,
        @Query('successUrl') successUrl?: string,
        @Query('cancelUrl') cancelUrl?: string,
    ): Promise<BookingWithCheckoutDto | { message: string }> {
        const userId = req.user.customer_id;
        const userEmail = req.user.email;
        
        const bookingWithCheckout = await this.bookingService.getBookingWithCheckoutLink(
            bookingId,
            userId,
            userEmail,
            successUrl,
            cancelUrl
        );

        if (!bookingWithCheckout) {
            return { message: 'Booking not found or access denied' };
        }

        return bookingWithCheckout;
    }

    @Patch(":id/status")
    updateStatus(@Param('id') id: string, @Body() updatecleaningstatus: UpdateBookingstatusDto) {
        return this.bookingService.updateStaus(+id, updatecleaningstatus)
    }
}
