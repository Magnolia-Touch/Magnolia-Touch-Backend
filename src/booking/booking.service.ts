import { PrismaService } from "src/prisma/prisma.service";
import { CreateBookingDto } from "./dto/booking.dto";
import { Injectable, HttpStatus } from "@nestjs/common";
import { StripeService } from "src/stripe/stripe.service";
import { generateOrderIdforService } from "src/utils/code-generator.util";

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
    flower_id: number,
    user_email: string
  ) {
    const { name_on_memorial, plot_no, date1, date2 } = bookingdto;

    const parsedDate1 = new Date(date1);
    const parsedDate2 = date2 ? new Date(date2) : null;
    const next_cleaning_date = new Date(date1);

    const church = await this.prisma.church.findUnique({ where: { church_id } });
    if (!church) {
      throw new Error('Church not found');
    }

    const subscribed_plan = await this.prisma.subscriptionPlan.findUnique({
      where: { Subscription_id: subscription_id },
    });
    if (!subscribed_plan) {
      throw new Error('Subscription plan not found');
    }

    const flower = await this.prisma.flowers.findUnique({ where: { flower_id } });
    if (!flower) {
      throw new Error('Flower not found');
    }
    const amount = parseInt(subscribed_plan.Price, 10)
    const booking = await this.prisma.booking.create({
      data: {
        booking_ids: generateOrderIdforService(),
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
    const paymentIntent = await this.stipeservice.createPaymentIntentforService(amount, 'usd', booking.booking_ids, user_email);


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
