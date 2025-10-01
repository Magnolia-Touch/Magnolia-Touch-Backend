import { Body, Controller, Get, Query, Request, UseGuards, Post, Req, ParseIntPipe, Patch, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateBookingDto } from "./dto/booking.dto";
import { BookingService } from "./booking.service";
import { BookingQueryDto } from "./dto/booking-query.dto";
import { UpdateBookingstatusDto } from "./dto/update-booking.dto";
import { CheckoutSessionLinkDto, BookingWithCheckoutDto, CreateBookingResponseDto } from "./dto/checkout-session-response.dto";
import { RolesGuard } from "src/common/decoraters/roles.guard";
import { Roles } from "src/common/decoraters/roles.decorator";
import { CleaningStatus } from '@prisma/client'; // adjust import path if needed

@Controller('booking')
export class BookingController {
    constructor(private bookingService: BookingService) { }

    @UseGuards(JwtAuthGuard)
    @Post("book-cleaning-service")
    async createbooking(
        @Request() req,
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

    @UseGuards(JwtAuthGuard)
    @Get('my-bookings')
    async getMyBookings(
        @Request() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // Safe defaults
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '10', 10);

        // Only fetch this user's bookings
        return this.bookingService.getUserBookingStatus(req.user.customer_id, pageNum, limitNum);
    }

    // USER: Get single booking status by booking id
    @UseGuards(JwtAuthGuard)
    @Get('my-bookings/:bookingId')
    async getBookingStatus(@Param('bookingId') bookingId: string, @Req() req) {
        return this.bookingService.getBookingStatusByBookingId(req.user.customer_id, bookingId);
    }

    // ADMIN: Update booking status
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch(':bookingId')
    async updateBookingStatus(
        @Param('bookingId') bookingId: string,
        @Body() dto: UpdateBookingstatusDto,
    ) {
        return this.bookingService.updateBookingStatus(bookingId, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('all-bookings')
    async getBookingsByAdmin(
        @Request() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // Safe defaults
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '10', 10);

        // Only fetch this user's bookings
        return this.bookingService.getUserBookingStatusByAdmin(pageNum, limitNum);
    }

    // Admin: Get single booking status by booking id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('all-bookings/:bookingId')
    async getBookingStatusbyAdmin(@Param('bookingId') bookingId: string, @Req() req) {
        return this.bookingService.getBookingStatusByBookingIdByAdmin(req.user.customer_id, bookingId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard) // if only logged-in users can access
    @Roles('ADMIN')
    @Get('service-bookings')
    async getServiceBookings(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('cleaningStatus') cleaningStatus?: CleaningStatus,
        @Query('dateQuery') dateQuery?: string // 🟢 single date parameter
    ) {
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '10', 10);

        return this.bookingService.findServiceBookings(
            pageNum,
            limitNum,
            cleaningStatus as CleaningStatus,
            dateQuery // 🟢 pass single date parameter
        );
    }


    @Patch('buy/:id')
    async markBookingAsBought(@Param('id') id: string) {
        return this.bookingService.patchBookingAsBought(id);
    }
}


