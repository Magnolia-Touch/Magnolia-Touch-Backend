import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/booking.dto';
import {
  Injectable,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { StripeService } from 'src/stripe/stripe.service';
import { generateOrderIdforService } from 'src/utils/code-generator.util';
import { ChurchService } from 'src/church/church.service';
import { UpdateBookingstatusDto } from './dto/update-booking.dto';
import {
  CheckoutSessionLinkDto,
  BookingWithCheckoutDto,
  CreateBookingResponseDto,
} from './dto/checkout-session-response.dto';
import { CleaningStatus } from '@prisma/client'; // adjust import path if needed
UpdateBookingstatusDto;
@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private stipeservice: StripeService,
    private churchservice: ChurchService,
  ) {}

  private ensureHttpsUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }

  private getDefaultUrl(path: string): string {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is not set');
    }
    const baseUrl = this.ensureHttpsUrl(frontendUrl);
    return `${baseUrl}${path}`;
  }

  async createBooking(
    bookingdto: CreateBookingDto,
    user_Id: number,
    user_email: string,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<CreateBookingResponseDto> {
    const {
      name_on_memorial,
      plot_no,
      first_cleaning_date,
      second_cleaning_date,
      anniversary_date,
      no_of_subsribe_years,
      church_name,
      city,
      state,
      subscription_id,
      flower_id,
    } = bookingdto;

    // Dates
    const first_date = new Date(first_cleaning_date);
    const second_date = second_cleaning_date
      ? new Date(second_cleaning_date)
      : null;
    const death_anniversary_date = anniversary_date
      ? new Date(anniversary_date)
      : null;

    // Church creation
    const church = await this.prisma.church.create({
      data: {
        church_name: church_name,
        city: city,
        state: state,
      },
    });

    // Subscription validation
    const subscribed_plan = await this.prisma.subscriptionPlan.findUnique({
      where: { Subscription_id: subscription_id },
    });
    if (!subscribed_plan) throw new Error('Subscription plan not found');
    if (no_of_subsribe_years) {
      if (!subscribed_plan.isSubscriptionPlan && no_of_subsribe_years > 1) {
        throw new Error('Please choose subscription for clean yearly');
      }
    }
    if (subscribed_plan?.Frequency !== 2 && second_cleaning_date) {
      throw new Error('Select suitable plan to clean for twice yearly');
    }

    // Flower
    const flower = flower_id
      ? await this.prisma.flowers.findUnique({ where: { flower_id } })
      : null;

    const amount = parseInt(subscribed_plan.Price, 10);

    // Helper to increment year but keep month/day constant
    function addYearsKeepMonthDay(baseDate: Date, yearsToAdd: number): Date {
      const y = baseDate.getFullYear() + yearsToAdd;
      const m = baseDate.getMonth();
      const d = baseDate.getDate();
      return new Date(y, m, d);
    }

    // --- 🟢 Create bookings in loop ---
    const totalYears = no_of_subsribe_years ?? 1;

    let firstBookingCreated: any;
    const bkng_parent_id = `${generateOrderIdforService()}-PARENT`;
    for (let i = 0; i < totalYears; i++) {
      const newFirstDate = addYearsKeepMonthDay(first_date, i);

      const newSecondDate = second_date
        ? addYearsKeepMonthDay(second_date, i)
        : null;

      const newAnniversaryDate = death_anniversary_date
        ? addYearsKeepMonthDay(death_anniversary_date, i)
        : null;

      const booking = await this.prisma.booking.create({
        data: {
          bkng_parent_id: bkng_parent_id,
          booking_ids: `${generateOrderIdforService()}-${i + 1}`, // guarantee uniqueness
          User_id: user_Id,
          church_id: church.church_id,
          name_on_memorial,
          plot_no,
          Subscription_id: subscription_id,
          amount: amount,
          first_cleaning_date: newFirstDate,
          second_cleaning_date: newSecondDate,
          Flower_id: flower_id ?? null,
          booking_date: new Date(),
          anniversary_date: newAnniversaryDate,
          no_of_subscription_years: totalYears,
          status: 'PENDING',
          is_bought: false,
          totalAmount: amount,
        },
      });

      // Only first booking gets checkout link + returned response
      if (i === 0) {
        const checkoutSession =
          await this.stipeservice.createCheckoutLinkForExistingBooking(
            booking,
            user_email,
            successUrl || this.getDefaultUrl('/booking/success'),
            cancelUrl || this.getDefaultUrl('/booking/cancel'),
          );

        firstBookingCreated = {
          id: booking.id,
          booking_ids: booking.booking_ids,
          name_on_memorial: booking.name_on_memorial,
          plot_no: booking.plot_no,
          amount: booking.amount,
          status: booking.status,
          is_bought: booking.is_bought,
          checkout_url: checkoutSession.url!,
          session_id: checkoutSession.id,
          payment_status: checkoutSession.payment_status || 'pending',
          expires_at: checkoutSession.expires_at
            ? new Date(checkoutSession.expires_at * 1000).toISOString()
            : undefined,
        };
      }
    }

    // Return response only for the first booking
    return {
      message: `Booking created successfully with checkout link (Created ${totalYears} bookings internally)`,
      booking: firstBookingCreated,
      status: HttpStatus.OK,
    };
  }

  async getUserCheckoutLinks(
    user_id: number,
    user_email: string,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<CheckoutSessionLinkDto[]> {
    // Get all user bookings
    const userBookings = await this.prisma.booking.findMany({
      where: { User_id: user_id },
      include: {
        Church: true,
        subscription: true,
        flower: true,
      },
      orderBy: { booking_date: 'desc' },
    });

    const checkoutLinks: CheckoutSessionLinkDto[] = [];

    for (const booking of userBookings) {
      try {
        // Create or retrieve checkout session for this booking
        const checkoutSession =
          await this.stipeservice.createCheckoutLinkForExistingBooking(
            booking,
            user_email,
            successUrl || this.getDefaultUrl('/booking/success'),
            cancelUrl || this.getDefaultUrl('/booking/cancel'),
          );

        checkoutLinks.push({
          checkout_url: checkoutSession.url!,
          session_id: checkoutSession.id,
          booking_id: booking.id,
          booking_ids: booking.booking_ids,
          amount: booking.amount,
          currency: 'usd',
          status: booking.status,
          payment_status: checkoutSession.payment_status || 'pending',
          expires_at: checkoutSession.expires_at
            ? new Date(checkoutSession.expires_at * 1000).toISOString()
            : undefined,
        });
      } catch (error) {
        console.error(
          `Failed to create checkout link for booking ${booking.id}:`,
          error,
        );
        // Continue with other bookings even if one fails
      }
    }

    return checkoutLinks;
  }

  async getBookingWithCheckoutLink(
    booking_id: number,
    user_id: number,
    user_email: string,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<BookingWithCheckoutDto | null> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: booking_id,
        User_id: user_id,
      },
      include: {
        Church: true,
        subscription: true,
        flower: true,
      },
    });

    if (!booking) {
      return null;
    }

    try {
      const checkoutSession =
        await this.stipeservice.createCheckoutLinkForExistingBooking(
          booking,
          user_email,
          successUrl || this.getDefaultUrl('/booking/success'),
          cancelUrl || this.getDefaultUrl('/booking/cancel'),
        );

      return {
        id: booking.id,
        booking_ids: booking.booking_ids,
        name_on_memorial: booking.name_on_memorial,
        plot_no: booking.plot_no,
        amount: booking.amount,
        status: booking.status,
        is_bought: booking.is_bought,
        checkout_url: checkoutSession.url!,
        session_id: checkoutSession.id,
        payment_status: checkoutSession.payment_status || 'pending',
        expires_at: checkoutSession.expires_at
          ? new Date(checkoutSession.expires_at * 1000).toISOString()
          : undefined,
      };
    } catch (error) {
      throw new Error(
        `Failed to create checkout link for booking: ${error.message}`,
      );
    }
  }

  async getUserBookingStatus(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where: { User_id: userId }, // <-- only this user's bookings
        select: {
          booking_ids: true,
          name_on_memorial: true,
          first_cleaning_date: true,
          second_cleaning_date: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }, // latest first
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: { User_id: userId } }),
    ]);

    if (!bookings || bookings.length === 0) {
      throw new NotFoundException('No bookings found for this user');
    }

    return {
      message: 'User bookings fetched successfully',
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      status: HttpStatus.OK,
    };
  }

  // USER: Check single booking status by booking id
  async getBookingStatusByBookingId(userId: number, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_ids: bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.User_id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to access this booking',
      );
    }

    return {
      message: 'Booking fetched successfully',
      data: {
        booking_ids: booking.booking_ids,
        status: booking.status,
        first_cleaning_date: booking.first_cleaning_date,
        second_cleaning_date: booking.second_cleaning_date,
      },
      status: HttpStatus.OK,
    };
  }

  //Admin only API
  // ADMIN: Update booking status
  async updateBookingStatus(bookingId: string, dto: UpdateBookingstatusDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_ids: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { booking_ids: bookingId },
      data: { status: dto.status },
    });

    return {
      message: 'Booking status updated successfully',
      data: updatedBooking,
      status: HttpStatus.OK,
    };
  }

  async getUserBookingStatusByAdmin(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        select: {
          id: true,
          booking_ids: true,
          name_on_memorial: true,
          first_cleaning_date: true,
          second_cleaning_date: true,
          status: true,
          createdAt: true,
          Flower_id: true, // ✅ needed to check if flower included
          user: {
            select: {
              customer_id: true,
              customer_name: true,
              Phone: true,
              email: true,
            },
          },
          subscription: {
            select: {
              Subscription_name: true,
              isSubscriptionPlan: true,
              Price: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count(),
    ]);

    if (!bookings || bookings.length === 0) {
      throw new NotFoundException('No bookings found');
    }

    // ✅ Add flowerIncluded flag dynamically
    const bookingsWithFlowerFlag = bookings.map((booking) => ({
      ...booking,
      flowerIncluded: booking.Flower_id !== null, // true if Flower_id exists
    }));

    // ✅ Optionally remove Flower_id from response
    const sanitizedBookings = bookingsWithFlowerFlag.map(
      ({ Flower_id, ...rest }) => rest,
    );

    return {
      message: 'User bookings fetched successfully',
      data: sanitizedBookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      status: HttpStatus.OK,
    };
  }

  //Admin only API
  // USER: Check single booking status by booking id
  async getBookingStatusByBookingIdByAdmin(userId: number, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_ids: bookingId },
      select: {
        id: true,
        booking_ids: true,
        name_on_memorial: true,
        first_cleaning_date: true,
        second_cleaning_date: true,
        status: true,
        createdAt: true,
        flower: {
          select: {
            Name: true,
            Price: true,
          },
        },
        user: {
          select: {
            customer_id: true,
            customer_name: true,
            Phone: true,
            email: true,
          },
        },
        subscription: {
          select: {
            Subscription_name: true,
            isSubscriptionPlan: true,
            Price: true,
          },
        },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return {
      message: 'Booking fetched successfully',
      data: booking,
      status: HttpStatus.OK,
    };
  }

  async findServiceBookings(
    page = 1,
    limit = 10,
    cleaningStatus?: CleaningStatus,
    dateQuery?: string, // 🟢 single date query
  ) {
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: any = {};

    // Filter by Cleaning Status
    if (cleaningStatus) {
      where.status = cleaningStatus;
    }

    // 🟢 Handle single dateQuery
    if (dateQuery) {
      const date = new Date(dateQuery);
      const datePlus7 = new Date(date);
      datePlus7.setDate(date.getDate() + 7);

      // Prisma "OR" for first_cleaning_date or second_cleaning_date
      where.OR = [
        // Case 1: first_cleaning_date within 7 days after dateQuery
        {
          first_cleaning_date: {
            gte: date,
            lte: datePlus7,
          },
        },
        // Case 2: first_cleaning_date before dateQuery AND second_cleaning_date within 7 days after dateQuery
        {
          AND: [
            {
              first_cleaning_date: { lt: date },
            },
            {
              second_cleaning_date: {
                gte: date,
                lte: datePlus7,
              },
            },
          ],
        },
      ];
    }

    const [bookings, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        select: {
          id: true,
          booking_ids: true,
          name_on_memorial: true,
          first_cleaning_date: true,
          second_cleaning_date: true,
          status: true,
          createdAt: true,
          Flower_id: true, // ✅ needed to check if flower included
          user: {
            select: {
              customer_id: true,
              customer_name: true,
              Phone: true,
              email: true,
            },
          },
          subscription: {
            select: {
              Subscription_name: true,
              isSubscriptionPlan: true,
              Price: true,
            },
          },
        },
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    // ✅ Add flowerIncluded flag dynamically
    const bookingsWithFlowerFlag = bookings.map((booking) => ({
      ...booking,
      flowerIncluded: booking.Flower_id !== null, // true if Flower_id exists
    }));

    // ✅ Optionally remove Flower_id from response
    const sanitizedBookings = bookingsWithFlowerFlag.map(
      ({ Flower_id, ...rest }) => rest,
    );

    return {
      message: 'Service bookings fetched successfully',
      data: sanitizedBookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      status: HttpStatus.OK,
    };
  }

  async patchBookingAsBought(booking_id: string): Promise<{ message: string }> {
    // 1. Find the booking first
    const booking = await this.prisma.booking.findUnique({
      where: { booking_ids: booking_id },
    });

    if (!booking) {
      throw new Error(`Booking with ID ${booking_id} not found`);
    }

    // 2. If it has a parent group, update all instances together
    if (booking.bkng_parent_id) {
      await this.prisma.booking.updateMany({
        where: { bkng_parent_id: booking.bkng_parent_id },
        data: {
          is_bought: true,
          status: 'COMPLETED',
        },
      });

      return {
        message: `All bookings under parent ${booking.bkng_parent_id} marked as bought`,
      };
    }

    // 3. Otherwise just update this single booking
    await this.prisma.booking.update({
      where: { booking_ids: booking_id },
      data: {
        is_bought: true,
        status: 'COMPLETED',
      },
    });

    return { message: `Booking ${booking_id} marked as bought` };
  }
}
