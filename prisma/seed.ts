import { PrismaClient, Role, OrderStatus, CleaningStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1️⃣ Users
  const admin = await prisma.user.create({
    data: {
      customer_name: 'Admin User',
      email: 'admin@example.com',
      Phone: '9999999999',
      password: 'securepassword',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      customer_name: 'John Doe',
      email: 'john@example.com',
      Phone: '8888888888',
      password: 'userpassword',
      role: Role.USER,
    },
  });

  const deliveryAgent = await prisma.user.create({
    data: {
      customer_name: 'Delivery Agent',
      email: 'agent@example.com',
      Phone: '7777777777',
      password: 'agentpassword',
      role: Role.DELIVERY,
    },
  });

  // 2️⃣ Addresses
  const shippingAddress = await prisma.userAddress.create({
    data: {
      Name: 'John Doe',
      street: '123 Main Street',
      town_or_city: 'Metropolis',
      country: 'USA',
      postcode: '12345',
      phone: '8888888888',
      email: 'john@example.com',
      userCustomer_id: user.customer_id,
    },
  });

  const billingAddress = await prisma.billingAddress.create({
    data: {
      Name: 'John Doe',
      street: '456 Market Street',
      town_or_city: 'Metropolis',
      country: 'USA',
      postcode: '12345',
      phone: '8888888888',
      email: 'john@example.com',
      userCustomer_id: user.customer_id,
    },
  });

  // 3️⃣ Products
  const product = await prisma.products.create({
    data: {
      product_name: 'Memorial Candle',
      price: '25.00',
      box_contains: '1x Candle',
      short_Description: 'A beautiful memorial candle.',
    },
  });

  // 4️⃣ Services
  await prisma.services.create({
    data: {
      image: 'service.jpg',
      name: 'Grave Cleaning',
      discription: 'Professional cleaning service for graves.',
      features: 'Cleaning, Decoration, Maintenance',
    },
  });

  // 5️⃣ Flowers
  const flower = await prisma.flowers.create({
    data: {
      image: 'flower.jpg',
      Name: 'Roses',
      Price: '15.00',
      Description: 'Fresh red roses bouquet.',
      in_stock: true,
    },
  });

  // 6️⃣ Subscription Plan
  const plan = await prisma.subscriptionPlan.create({
    data: {
      discription: 'Annual Grave Cleaning',
      Subscription_name: 'Yearly Plan',
      Frequency: 12,
      Price: '100.00',
    },
  });

  // 7️⃣ Church
  const church = await prisma.church.create({
    data: {
      church_name: 'St. Mary Church',
      city: 'Metropolis',
      state: 'NY',
      church_address: '101 Church Road',
      userCustomer_id: admin.customer_id,
    },
  });

  // 8️⃣ DeadPersonProfile
  const profile = await prisma.deadPersonProfile.create({
    data: {
      owner_id: user.email,
      name: 'Jane Doe',
      profile_image: 'profile.jpg',
      background_image: 'bg.jpg',
      born_date: '1950-01-01',
      death_date: '2020-01-01',
      memorial_place: 'St. Mary Cemetery',
      slug: 'jane-doe-memorial',
      is_paid: true,
    },
  });

  await prisma.biography.create({
    data: {
      short_caption_of_life: 'Beloved mother and wife.',
      life_summary: 'Jane Doe lived a kind and generous life.',
      deadPersonProfiles: profile.slug,
    },
  });

  // 9️⃣ Cart + CartItems
  const cart = await prisma.cart.create({
    data: {
      userId: user.customer_id,
      total_amount: '25.00',
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.cartId,
      productId: product.product_id,
      quantity: 1,
      price: 25.0,
    },
  });

  // 🔟 Orders
  await prisma.orders.create({
    data: {
      User_id: user.customer_id,
      orderNumber: 'ORD12345',
      status: OrderStatus.pending,
      totalAmount: 25.0,
      billingAddressId: billingAddress.bill_address_id,
      shippingAddressId: shippingAddress.deli_address_id,
      church_id: church.church_id,
      memoryProfileId: profile.slug,
      is_paid: false,
    },
  });

  console.log('✅ Seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
