import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Helper function to hash passwords
  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  try {
    // 1. Create Admin and Test Users
    console.log('👤 Creating users...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@magnolia.com' },
      update: {},
      create: {
        customer_name: 'Magnolia Admin',
        email: 'admin@magnolia.com',
        password: await hashPassword('admin123'),
        Phone: '+1234567890',
        role: 'ADMIN',
      },
    });

    const testUser = await prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        customer_name: 'John Doe',
        email: 'john.doe@example.com',
        password: await hashPassword('password123'),
        Phone: '+1987654321',
        role: 'USER',
      },
    });

    const deliveryAgent = await prisma.user.upsert({
      where: { email: 'delivery@magnolia.com' },
      update: {},
      create: {
        customer_name: 'Delivery Agent',
        email: 'delivery@magnolia.com',
        password: await hashPassword('delivery123'),
        Phone: '+1555666777',
        role: 'DELIVERY',
      },
    });

    console.log(`✅ Created users: Admin, Test User, Delivery Agent`);

    // 2. Create User Addresses
    console.log('🏠 Creating addresses...');
    const userAddress = await prisma.userAddress.create({
      data: {
        Name: 'John Doe',
        street: '123 Main Street',
        town_or_city: 'New York',
        country: 'United States',
        postcode: '10001',
        phone: '+1987654321',
        email: 'john.doe@example.com',
        userCustomer_id: testUser.customer_id,
      },
    });

    const billingAddress = await prisma.billingAddress.create({
      data: {
        Name: 'John Doe',
        street: '456 Billing Avenue',
        town_or_city: 'New York',
        country: 'United States',
        postcode: '10002',
        phone: '+1987654321',
        email: 'john.doe@example.com',
        userCustomer_id: testUser.customer_id,
      },
    });

    console.log(`✅ Created addresses for users`);

    // 3. Create Churches
    console.log('⛪ Creating churches...');
    const church1 = await prisma.church.create({
      data: {
        church_name: "St. Mary's Cathedral",
        city: 'New York',
        state: 'NY',
        church_address: '123 Cathedral Street, New York, NY 10001',
        userCustomer_id: adminUser.customer_id,
      },
    });

    const church2 = await prisma.church.create({
      data: {
        church_name: 'Grace Memorial Chapel',
        city: 'Los Angeles',
        state: 'CA',
        church_address: '456 Grace Boulevard, Los Angeles, CA 90210',
        userCustomer_id: adminUser.customer_id,
      },
    });

    console.log(`✅ Created ${2} churches`);

    // 4. Create Subscription Plans
    console.log('📋 Creating subscription plans...');
    const basicPlan = await prisma.subscriptionPlan.create({
      data: {
        Subscription_name: 'Basic Memorial Care',
        discription: 'Monthly cleaning and maintenance service for memorial sites',
        Frequency: 12, // Monthly visits
        Price: '99.99',
      },
    });

    const premiumPlan = await prisma.subscriptionPlan.create({
      data: {
        Subscription_name: 'Premium Memorial Care',
        discription: 'Bi-weekly cleaning, flower replacement, and maintenance service',
        Frequency: 24, // Bi-weekly visits
        Price: '199.99',
      },
    });

    const annualPlan = await prisma.subscriptionPlan.create({
      data: {
        Subscription_name: 'Annual Memorial Package',
        discription: 'Complete annual memorial care with seasonal decorations',
        Frequency: 4, // Quarterly visits
        Price: '299.99',
      },
    });

    console.log(`✅ Created ${3} subscription plans`);

    // 5. Create Flowers
    console.log('🌸 Creating flowers...');
    const flowers = [
      {
        Name: 'White Lilies',
        Description: 'Beautiful white lilies perfect for memorial services',
        Price: '45.99',
        in_stock: true,
        image: 'https://example-bucket.s3.amazonaws.com/flowers/white-lilies.jpg',
      },
      {
        Name: 'Red Roses',
        Description: 'Classic red roses symbolizing love and remembrance',
        Price: '39.99',
        in_stock: true,
        image: 'https://example-bucket.s3.amazonaws.com/flowers/red-roses.jpg',
      },
      {
        Name: 'Peaceful Daisies',
        Description: 'Gentle white daisies representing peace and innocence',
        Price: '29.99',
        in_stock: true,
        image: 'https://example-bucket.s3.amazonaws.com/flowers/peaceful-daisies.jpg',
      },
      {
        Name: 'Memorial Bouquet',
        Description: 'Mixed seasonal flowers arranged in loving memory',
        Price: '69.99',
        in_stock: false,
        image: 'https://example-bucket.s3.amazonaws.com/flowers/memorial-bouquet.jpg',
      },
    ];

    const createdFlowers: any[] = [];
    for (const flower of flowers) {
      const createdFlower = await prisma.flowers.create({ data: flower });
      createdFlowers.push(createdFlower);
    }

    console.log(`✅ Created ${flowers.length} flowers`);

    // 6. Create Services
    console.log('🛠️ Creating services...');
    const services = [
      {
        name: 'Memorial Stone Cleaning',
        discription: 'Professional cleaning and polishing of memorial stones and monuments',
        features: 'Deep cleaning, moss removal, polishing, protective coating application',
        image: 'https://example-bucket.s3.amazonaws.com/services/stone-cleaning.jpg',
      },
      {
        name: 'Garden Maintenance',
        discription: 'Complete garden care around memorial sites',
        features: 'Weeding, pruning, seasonal planting, irrigation system maintenance',
        image: 'https://example-bucket.s3.amazonaws.com/services/garden-maintenance.jpg',
      },
      {
        name: 'Flower Arrangement Service',
        discription: 'Regular fresh flower arrangements for memorial sites',
        features: 'Seasonal arrangements, weather-resistant displays, color coordination',
        image: 'https://example-bucket.s3.amazonaws.com/services/flower-arrangement.jpg',
      },
    ];

    for (const service of services) {
      await prisma.services.create({ data: service });
    }

    console.log(`✅ Created ${services.length} services`);

    // 7. Create Products
    console.log('📦 Creating products...');
    const products = [
      {
        product_name: 'Memorial Candle Set',
        price: '29.99',
        box_contains: '3 memorial candles, brass holder, matches',
        short_Description: 'Beautiful memorial candle set for remembrance ceremonies',
        detailed_description: 'A carefully crafted set of long-burning memorial candles designed to honor the memory of loved ones. Each set includes three white candles, a brass holder, and wooden matches.',
        company_guarantee: '30-day satisfaction guarantee with free replacement if damaged',
      },
      {
        product_name: 'Engraved Memory Stone',
        price: '89.99',
        box_contains: 'Granite stone, custom engraving, protective coating',
        short_Description: 'Personalized granite memory stone with custom engraving',
        detailed_description: 'High-quality granite stone with laser engraving technology for permanent, weather-resistant memorial messages.',
        company_guarantee: '5-year weather protection guarantee',
      },
      {
        product_name: 'Memorial Photo Frame',
        price: '39.99',
        box_contains: 'Weather-resistant frame, mounting hardware, cleaning kit',
        short_Description: 'Weather-resistant memorial photo frame for outdoor use',
        detailed_description: 'Durable, weather-resistant photo frame designed for outdoor memorial displays. UV-resistant glass protects photos from fading.',
        company_guarantee: '2-year weather damage guarantee',
      },
      {
        product_name: 'Remembrance Wind Chime',
        price: '59.99',
        box_contains: 'Aluminum wind chime, mounting hardware, care instructions',
        short_Description: 'Peaceful wind chime for memorial gardens',
        detailed_description: 'Handcrafted aluminum wind chime with soothing tones, perfect for creating a peaceful atmosphere in memorial gardens.',
        company_guarantee: '1-year structural guarantee',
      },
    ];

    const createdProducts: any[] = [];
    for (const product of products) {
      const createdProduct = await prisma.products.create({ data: product });
      createdProducts.push(createdProduct);
    }

    console.log(`✅ Created ${products.length} products`);

    // 8. Create Memorial Profiles
    console.log('🏺 Creating memorial profiles...');
    
    // Generate unique codes for memorial profiles
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 13; i++) {
        if (i === 5 || i === 9) {
          result += '-';
        } else {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      return result;
    };

    const memorialCode1 = generateCode();
    const memorial1 = await prisma.deadPersonProfile.create({
      data: {
        owner_id: testUser.email,
        name: 'John Smith',
        profile_image: 'https://example-bucket.s3.amazonaws.com/profiles/john-smith/profile.jpg',
        background_image: 'https://example-bucket.s3.amazonaws.com/profiles/john-smith/background.jpg',
        born_date: '1950-03-15',
        death_date: '2023-11-20',
        memorial_place: 'Green Valley Cemetery, Section A, Plot 123',
        slug: memorialCode1,
      },
    });

    const memorialCode2 = generateCode();
    const memorial2 = await prisma.deadPersonProfile.create({
      data: {
        owner_id: adminUser.email,
        name: 'Mary Johnson',
        profile_image: 'https://example-bucket.s3.amazonaws.com/profiles/mary-johnson/profile.jpg',
        born_date: '1945-07-22',
        death_date: '2023-09-15',
        memorial_place: 'Peaceful Gardens Cemetery',
        slug: memorialCode2,
      },
    });

    console.log(`✅ Created memorial profiles with codes: ${memorialCode1}, ${memorialCode2}`);

    // 9. Create Biography, Gallery, Family, and Guestbook for each memorial
    console.log('📝 Creating memorial content...');
    
    // Biography for memorial 1
    await prisma.biography.create({
      data: {
        short_caption_of_life: 'Loving father, devoted husband, and community leader',
        life_summary: 'John Smith lived a life dedicated to family and service. He spent 40 years as a teacher, inspiring thousands of students. His passion for education and community service left a lasting impact on everyone he met.',
        personality_lifevalue: 'Known for his kindness, wisdom, and unwavering integrity. He believed in the power of education and the importance of helping others.',
        impact_on_others: 'John mentored countless young teachers and students. His legacy lives on through the scholarship fund established in his name.',
        deadPersonProfiles: memorialCode1,
      },
    });

    // Gallery for memorial 1
    const gallery1 = await prisma.gallery.create({
      data: {
        deadPersonProfiles: memorialCode1,
      },
    });

    // Add photos to gallery
    await prisma.photos.create({
      data: {
        url: 'https://example-bucket.s3.amazonaws.com/profiles/john-smith/gallery/photos/family-photo-1.jpg',
        gallery_id: gallery1.gallery_id,
        deadPersonProfiles: memorialCode1,
      },
    });

    await prisma.photos.create({
      data: {
        url: 'https://example-bucket.s3.amazonaws.com/profiles/john-smith/gallery/photos/graduation-photo.jpg',
        gallery_id: gallery1.gallery_id,
        deadPersonProfiles: memorialCode1,
      },
    });

    // Family for memorial 1
    const family1 = await prisma.family.create({
      data: {
        deadPersonProfiles: memorialCode1,
      },
    });

    // Add family members
    await prisma.spouse.create({
      data: {
        name: 'Margaret Smith',
        family_id: family1.family_id,
        deadPersonProfiles: memorialCode1,
      },
    });

    await prisma.childrens.create({
      data: {
        name: 'Michael Smith',
        family_id: family1.family_id,
        deadPersonProfiles: memorialCode1,
      },
    });

    await prisma.childrens.create({
      data: {
        name: 'Sarah Smith-Johnson',
        family_id: family1.family_id,
        deadPersonProfiles: memorialCode1,
      },
    });

    // Guestbook for memorial 1
    const guestbook1 = await prisma.guestBook.create({
      data: {
        deadPersonProfiles: memorialCode1,
      },
    });

    // Add guestbook entries
    await prisma.guestBookItems.create({
      data: {
        guestbook_id: guestbook1.guestbook_id,
        first_name: 'Robert',
        last_name: 'Williams',
        email: 'robert.williams@example.com',
        phone: '+1555123456',
        message: 'John was an incredible teacher and mentor. He changed my life and the lives of so many students. His legacy will live on forever.',
        photo_upload: 'https://example-bucket.s3.amazonaws.com/guestbook/john-smith/images/robert-williams.jpg',
        date: new Date().toISOString(),
        is_approved: true,
      },
    });

    await prisma.guestBookItems.create({
      data: {
        guestbook_id: guestbook1.guestbook_id,
        first_name: 'Lisa',
        last_name: 'Davis',
        email: 'lisa.davis@example.com',
        message: 'Mr. Smith was the best teacher I ever had. He believed in me when I didn\'t believe in myself. Thank you for everything.',
        date: new Date().toISOString(),
        is_approved: true,
      },
    });

    console.log(`✅ Created memorial content for ${memorial1.name}`);

    // Similar structure for memorial 2 (abbreviated)
    await prisma.biography.create({
      data: {
        short_caption_of_life: 'Beloved mother, grandmother, and community volunteer',
        life_summary: 'Mary Johnson dedicated her life to caring for others as a nurse and community volunteer.',
        deadPersonProfiles: memorialCode2,
      },
    });

    const gallery2 = await prisma.gallery.create({
      data: { deadPersonProfiles: memorialCode2 },
    });

    const family2 = await prisma.family.create({
      data: { deadPersonProfiles: memorialCode2 },
    });

    const guestbook2 = await prisma.guestBook.create({
      data: { deadPersonProfiles: memorialCode2 },
    });

    // 10. Create Bookings
    console.log('📅 Creating sample bookings...');
    const booking1 = await prisma.booking.create({
      data: {
        booking_ids: 'BK-' + Date.now(),
        name_on_memorial: 'John Smith Memorial',
        plot_no: 'A-123',
        User_id: testUser.customer_id,
        church_id: church1.church_id,
        Subscription_id: basicPlan.Subscription_id,
        amount: 9999, // $99.99 in cents
        first_cleaning_date: new Date('2024-02-01'),
        second_cleaning_date: new Date('2024-02-15'),
        no_of_subscription_years: 1,
        Flower_id: createdFlowers[0].flower_id,
        booking_date: new Date(),
        anniversary_date: new Date('2023-11-20'),
        status: 'confirmed',
        is_bought: true,
      },
    });

    console.log(`✅ Created sample booking: ${booking1.booking_ids}`);

    // 11. Create Shopping Cart
    console.log('🛒 Creating sample cart...');
    const cart = await prisma.cart.create({
      data: {
        userId: testUser.customer_id,
        total_amount: '89.98',
      },
    });

    // Add items to cart
    await prisma.cartItem.create({
      data: {
        cartId: cart.cartId,
        productId: createdProducts[0].product_id,
        quantity: 2,
        price: 29.99,
      },
    });

    await prisma.cartItem.create({
      data: {
        cartId: cart.cartId,
        productId: createdProducts[2].product_id,
        quantity: 1,
        price: 39.99,
      },
    });

    console.log(`✅ Created shopping cart with items`);

    // 12. Create Sample Order
    console.log('📋 Creating sample order...');
    const order = await prisma.orders.create({
      data: {
        User_id: testUser.customer_id,
        orderNumber: 'ORD-' + Date.now(),
        status: 'pending',
        totalAmount: 89.98,
        shippingCost: 9.99,
        taxAmount: 7.99,
        discountAmount: 0,
        notes: 'Please handle with care - memorial items',
        shippingAddressId: userAddress.deli_address_id,
        billingAddressId: billingAddress.bill_address_id,
      },
    });

    await prisma.orderItems.create({
      data: {
        order_id: order.id,
        productId: createdProducts[0].product_id,
        quantity: 2,
        price: 29.99,
        total: 59.98,
        userCustomer_id: testUser.customer_id,
      },
    });

    console.log(`✅ Created sample order: ${order.orderNumber}`);

    // 13. Create Delivery Agent Profile
    console.log('🚚 Creating delivery agent profile...');
    await prisma.deliveryAgentProfile.create({
      data: {
        deliveryagent_id: deliveryAgent.customer_id,
      },
    });

    // 14. Create Review
    console.log('⭐ Creating sample reviews...');
    await prisma.reviews.create({
      data: {
        User_Id: testUser.customer_id,
        Review_Description: 'Excellent service! The memorial cleaning was thorough and respectful. Highly recommend.',
        Rating: 5,
      },
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 SEEDED DATA SUMMARY:');
    console.log('=======================');
    console.log('👥 Users: 3 (1 Admin, 1 User, 1 Delivery Agent)');
    console.log('🏠 Addresses: 2 (1 User Address, 1 Billing Address)');
    console.log('⛪ Churches: 2');
    console.log('📋 Subscription Plans: 3');
    console.log('🌸 Flowers: 4');
    console.log('🛠️ Services: 3');
    console.log('📦 Products: 4');
    console.log(`🏺 Memorial Profiles: 2 (${memorialCode1}, ${memorialCode2})`);
    console.log('📅 Bookings: 1');
    console.log('🛒 Cart with Items: 1');
    console.log('📋 Orders: 1');
    console.log('⭐ Reviews: 1');
    console.log('');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('=====================');
    console.log('Admin: admin@magnolia.com / admin123');
    console.log('User: john.doe@example.com / password123');
    console.log('Delivery: delivery@magnolia.com / delivery123');
    console.log('');
    console.log('🏺 MEMORIAL CODES:');
    console.log('==================');
    console.log(`John Smith: ${memorialCode1}`);
    console.log(`Mary Johnson: ${memorialCode2}`);
    console.log('');
    console.log('🌐 Note: All S3 URLs are examples. Update with your actual bucket URLs.');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
