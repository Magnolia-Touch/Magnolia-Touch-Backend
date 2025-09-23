import { PrismaClient, Role, OrderStatus, CleaningStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. User
  const user = await prisma.user.create({
    data: {
      customer_name: 'John Doe',
      email: 'john@example.com',
      Phone: '1234567890',
      password: 'hashed_password',
      role: Role.USER,
    },
  });

  // 2. Addresses
  const billing = await prisma.billingAddress.create({
    data: {
      Name: 'John Doe',
      street: '123 Street',
      town_or_city: 'City',
      country: 'Country',
      postcode: '12345',
      phone: '1234567890',
      email: 'john@example.com',
      userCustomer_id: user.customer_id,
    },
  });

  const shipping = await prisma.userAddress.create({
    data: {
      Name: 'John Doe',
      street: '123 Street',
      town_or_city: 'City',
      country: 'Country',
      postcode: '12345',
      phone: '1234567890',
      email: 'john@example.com',
      userCustomer_id: user.customer_id,
    },
  });

  // 3. Product + Dimension
  const product = await prisma.products.create({
    data: {
      product_name: 'Coffin',
      price: '1999',
      short_Description: 'A premium wooden coffin.',
      Dimensions: {
        create: [{ dimension: '200x70x50 cm' }],
      },
    },
  });

  // 4. Cart + CartItem
  await prisma.cart.create({
    data: {
      userId: user.customer_id,
      total_amount: '1999',
      items: {
        create: [
          {
            productId: product.product_id,
            quantity: 1,
            price: 1999,
          },
        ],
      },
    },
  });

  // 5. Church
  const church = await prisma.church.create({
    data: {
      church_name: 'St. Mary Church',
      city: 'Springfield',
      state: 'IL',
      church_address: '45 Church Rd',
      userCustomer_id: user.customer_id,
    },
  });

  // 6. SubscriptionPlan + Flower
  const plan = await prisma.subscriptionPlan.create({
    data: {
      Subscription_name: 'Annual Cleaning',
      discription: 'Yearly grave maintenance',
      Frequency: 12,
      Price: '500',
    },
  });

  const flower = await prisma.flowers.create({
    data: {
      image: 'flower.jpg',
      Name: 'Roses',
      Price: '50',
      in_stock: true,
    },
  });

  // 7. Booking
  await prisma.booking.create({
    data: {
      booking_ids: 'BKG123',
      name_on_memorial: 'Jane Doe',
      User_id: user.customer_id,
      church_id: church.church_id,
      Subscription_id: plan.Subscription_id,
      amount: 500,
      first_cleaning_date: new Date(),
      booking_date: new Date(),
      Flower_id: flower.flower_id,
      status: CleaningStatus.PENDING,
    },
  });

  // 8. DeadPersonProfile with related tables
  const dpp = await prisma.deadPersonProfile.create({
    data: {
      owner_id: user.email,
      firstName: 'Jane',
      lastName: 'Doe',
      born_date: '1950-01-01',
      death_date: '2020-01-01',
      memorial_place: 'Greenwood Cemetery',
      profile_image: 'profile.jpg',
      background_image: 'background.jpg',
      is_paid: true,
      slug: 'jane-doe',

      // Related data
      biography: {
        create: [
          { discription: 'She loved gardening.' },
          { discription: 'She was a community volunteer.' },
        ],
      },
      gallery: {
        create: [{ link: 'image1.jpg' }, { link: 'image2.jpg' }],
      },
      family: {
        // string relationship, not enum
        create: [
          { relationship: 'Spouse', name: 'John Doe' },
          { relationship: 'Childrens', name: 'Emily Doe' },
        ],
      },
      guestBook: {
        create: {
          guestBookItems: {
            create: [
              {
                first_name: 'Visitor',
                message: 'Rest in peace',
                date: '2023-01-01',
              },
            ],
          },
        },
      },
      SocialLinks: {
        create: [
          {
            socialMediaName: 'Facebook', // string
            link: 'https://facebook.com/jane',
          },
          {
            socialMediaName: 'Instagram',
            link: 'https://instagram.com/jane',
          },
        ],
      },
      Events: {
        create: [
          {
            year: '1990',
            event: 'Marriage',
          },
          {
            year: '2010',
            event: 'Retirement',
          },
        ],
      },
    },
  });

  // 9. Order
  await prisma.orders.create({
    data: {
      User_id: user.customer_id,
      orderNumber: 'ORD123',
      totalAmount: 1999, // decimal
      memoryProfileId: dpp.slug,
      billingAddressId: billing.bill_address_id,
      shippingAddressId: shipping.deli_address_id,
      church_id: church.church_id,
      status: OrderStatus.pending,
      is_paid: false,
    },
  });

  console.log('✅ Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
