import { PrismaClient, Role, OrderStatus, CleaningStatus } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // 1. User
  const user = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      customer_name: 'John Doe',
      email: 'john@example.com',
      Phone: '1234567890',
      password: 'hashed_password',
      role: Role.USER,
    },
  });

  // 2. Addresses
  const billing = await prisma.billingAddress.upsert({
    where: { bill_address_id: 1 },
    update: {},
    create: {
      Name: 'John Doe',
      street: '123 Street',
      town_or_city: 'City',
      country: 'Country',
      postcode: '12345',
      phone: '1234567890',
      email: user.email,
      userCustomer_id: user.customer_id,
    },
  });

  const shipping = await prisma.userAddress.upsert({
    where: { deli_address_id: 1 },
    update: {},
    create: {
      Name: 'John Doe',
      street: '123 Street',
      town_or_city: 'City',
      country: 'Country',
      postcode: '12345',
      phone: '1234567890',
      email: user.email,
      userCustomer_id: user.customer_id,
    },
  });

  // 3. Product
  const product = await prisma.products.upsert({
    where: { product_id: 1 },
    update: {},
    create: {
      product_name: 'Coffin',
      price: '1999',
      short_Description: 'A premium wooden coffin.',
      Dimensions: { create: [{ dimension: '200x70x50 cm' }] },
    },
  });

  // 4. Church
  const church = await prisma.church.upsert({
    where: { church_id: 1 },
    update: {},
    create: {
      church_name: 'St. Mary Church',
      city: 'Springfield',
      state: 'IL',
      church_address: '45 Church Rd',
      userCustomer_id: user.customer_id,
    },
  });

  // 5. SubscriptionPlan + Flower
  const plan = await prisma.subscriptionPlan.upsert({
    where: { Subscription_id: 1 },
    update: {},
    create: {
      Subscription_name: 'Annual Cleaning',
      discription: 'Yearly grave maintenance',
      Frequency: 12,
      Price: '500',
    },
  });

  const flower = await prisma.flowers.upsert({
    where: { flower_id: 1 },
    update: {},
    create: {
      image: 'flower.jpg',
      Name: 'Roses',
      Price: '50',
      in_stock: true,
    },
  });

  // 6. Seed multiple Bookings (e.g., 50)
  for (let i = 1; i <= 50; i++) {
    const daysAgo = randomInt(0, 180); // last 6 months
    await prisma.booking.create({
      data: {
        booking_ids: `BKG${i}-${Date.now()}`,
        name_on_memorial: `Jane Doe ${i}`,
        User_id: user.customer_id,
        church_id: church.church_id,
        Subscription_id: plan.Subscription_id,
        amount: randomInt(100, 1000),
        first_cleaning_date: subDays(new Date(), daysAgo),
        booking_date: subDays(new Date(), daysAgo),
        Flower_id: flower.flower_id,
        status: CleaningStatus.PENDING,
        totalAmount: randomInt(100, 1000),
        is_bought: true,
      },
    });
  }

  // 7. Seed multiple Orders (e.g., 50)
  for (let i = 1; i <= 50; i++) {
    const daysAgo = randomInt(0, 180);
    const dpp = await prisma.deadPersonProfile.upsert({
      where: { slug: `jane-doe-${i}` },
      update: {},
      create: {
        owner_id: user.email,
        firstName: 'Jane',
        lastName: `Doe ${i}`,
        born_date: '1950-01-01',
        death_date: '2020-01-01',
        memorial_place: 'Greenwood Cemetery',
        slug: `jane-doe-${i}`,
        is_paid: true,
      },
    });

    await prisma.orders.create({
      data: {
        User_id: user.customer_id,
        orderNumber: `ORD${i}-${Date.now()}`,
        totalAmount: randomInt(100, 5000),
        memoryProfileId: dpp.slug,
        billingAddressId: billing.bill_address_id,
        shippingAddressId: shipping.deli_address_id,
        church_id: church.church_id,
        status: OrderStatus.delivered,
        is_paid: Math.random() > 0.2, // some unpaid orders
        createdAt: subDays(new Date(), daysAgo),
      },
    });
  }

  console.log('✅ Seeded multiple users, bookings, and orders for revenue testing');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
