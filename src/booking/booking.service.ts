import { PrismaService } from "src/prisma/prisma.service";
import { CreateBookingDto } from "./dto/booking.dto";
import { Injectable, HttpStatus } from "@nestjs/common";
import { StripeService } from "src/stripe/stripe.service";
import { generateOrderIdforService } from "src/utils/code-generator.util";
import { ChurchService } from "src/church/church.service";
import { UpdateBookingstatusDto } from "./dto/update-booking.dto";

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService,
    private stipeservice: StripeService,
    private churchservice: ChurchService
  ) { }

  async createBooking(
    bookingdto: CreateBookingDto,
    user_Id: number,
    user_email: string
  ) {
    const { name_on_memorial, plot_no, first_cleaning_date, second_cleaning_date, anniversary_date, no_of_subsribe_years, church_name, city, state, subscription_id, flower_id } = bookingdto;

    const first_date = new Date(first_cleaning_date);
    const second_date = second_cleaning_date ? new Date(second_cleaning_date) : null;
    const death_anniversary_date = anniversary_date ? new Date(anniversary_date) : null;

    const church = await this.prisma.church.create({
      data: {
        church_name: church_name,
        city: city,
        state: state
      }
    })

    const subscribed_plan = await this.prisma.subscriptionPlan.findUnique({
      where: { Subscription_id: subscription_id },
    });
    if (!subscribed_plan) {
      throw new Error('Subscription plan not found');
    }

    const flower = flower_id
      ? await this.prisma.flowers.findUnique({ where: { flower_id } })
      : null;

    const amount = parseInt(subscribed_plan.Price, 10)
    const booking = await this.prisma.booking.create({
      data: {
        booking_ids: generateOrderIdforService(),
        User_id: user_Id,
        church_id: church.church_id,
        name_on_memorial,
        plot_no,
        Subscription_id: subscription_id,
        amount: amount,
        first_cleaning_date: first_date,
        second_cleaning_date: second_date,
        Flower_id: flower_id ?? null,
        booking_date: new Date(),
        anniversary_date: death_anniversary_date,
        no_of_subscription_years: no_of_subsribe_years ?? 0,
        status: 'pending',
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


  async updateStaus(id: number, updatecleaningstatus: UpdateBookingstatusDto) {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: updatecleaningstatus.status, // ✅ now valid
      },
    })
  }


  // ##need to connect stripe webhook to confirm payment and thereafter booking
}


