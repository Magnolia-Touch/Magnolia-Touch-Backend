import { PrismaService } from "src/prisma/prisma.service";
import { CreateBookingDto } from "./dto/booking.dto";
import { Injectable, HttpStatus } from "@nestjs/common";
import { StripeService } from "src/stripe/stripe.service";

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService,
    private stipeservice: StripeService
  ) {}

  async createBooking(
    bookingdto: CreateBookingDto,
    user_Id: number,
    church_id: number,
    subscription_id: number,
    flower_id: number
  ) {
    const { name_on_memorial, plot_no, date1, date2 } = bookingdto;

    const parsedDate1 = new Date(date1);
    const parsedDate2 = date2 ? new Date(date2) : null;
    const next_cleaning_date = new Date(date1);

    const church = await this.prisma.church.findUnique({ where: { church_id } });
    if (!church) {
      return {
        message: 'Church not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }

    const subscribed_plan = await this.prisma.subscriptionPlan.findUnique({
      where: { Subscription_id: subscription_id },
    });
    if (!subscribed_plan) {
      return {
        message: 'Subscription plan not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }

    const flower = await this.prisma.flowers.findUnique({ where: { flower_id } });
    if (!flower) {
      return {
        message: 'Flower not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }
    const amount = parseInt(subscribed_plan.Price, 10)
    const booking = await this.prisma.booking.create({
      data: {
        User_id: user_Id,
        church_id,
        name_on_memorial,
        plot_no,
        Subscription_id: subscription_id,
        amount: amount,
        date1: parsedDate1,
        date2: parsedDate2,
        Flower_id: flower_id,
        booking_date: new Date(),
        next_cleaning_date,
        status: 'CONFIRMED',
        is_bought: false,
      },
    });
    const paymentIntent = await this.stipeservice.createPaymentIntent(amount, 'usd');


    return {
      message: 'Booking created successfully',
      data: {
        booking,
        paymentIntent
      },
      status: HttpStatus.OK,
    };
  }
}
