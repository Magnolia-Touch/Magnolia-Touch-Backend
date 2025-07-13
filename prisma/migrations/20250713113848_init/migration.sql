-- CreateTable
CREATE TABLE "User" (
    "customer_id" SERIAL NOT NULL,
    "customer_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "Phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "Products" (
    "product_id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "box_contains" TEXT,
    "short_Description" TEXT NOT NULL,
    "detailed_description" TEXT,
    "company_guarantee" TEXT,
    "order_ids" INTEGER NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "Order_id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Order_Status" TEXT NOT NULL,
    "Total_Amount" DOUBLE PRECISION NOT NULL,
    "Payment_Details" TEXT NOT NULL,
    "Tracking_Details" TEXT NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("Order_id")
);

-- CreateTable
CREATE TABLE "ProductDimension" (
    "dimension_id" SERIAL NOT NULL,
    "dimension" TEXT NOT NULL,
    "productsProduct_id" INTEGER,

    CONSTRAINT "ProductDimension_pkey" PRIMARY KEY ("dimension_id")
);

-- CreateTable
CREATE TABLE "Grave" (
    "Grave_id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Address" TEXT NOT NULL,

    CONSTRAINT "Grave_pkey" PRIMARY KEY ("Grave_id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "Subscription_id" SERIAL NOT NULL,
    "Service_Name" TEXT NOT NULL,
    "Subscription_name" TEXT NOT NULL,
    "Frequency" INTEGER NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("Subscription_id")
);

-- CreateTable
CREATE TABLE "Flowers" (
    "flower_id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,
    "Description" TEXT,
    "in_stock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Flowers_pkey" PRIMARY KEY ("flower_id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "booking_id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Grave_id" INTEGER NOT NULL,
    "Subscription_id" INTEGER NOT NULL,
    "date1" TIMESTAMP(3) NOT NULL,
    "date2" TIMESTAMP(3),
    "Flower_id" INTEGER NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL,
    "next_cleaning_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "Review_id" SERIAL NOT NULL,
    "User_Id" INTEGER NOT NULL,
    "Review_Description" TEXT NOT NULL,
    "Rating" INTEGER NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("Review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_Phone_key" ON "User"("Phone");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_order_ids_fkey" FOREIGN KEY ("order_ids") REFERENCES "Orders"("Order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDimension" ADD CONSTRAINT "ProductDimension_productsProduct_id_fkey" FOREIGN KEY ("productsProduct_id") REFERENCES "Products"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grave" ADD CONSTRAINT "Grave_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_Grave_id_fkey" FOREIGN KEY ("Grave_id") REFERENCES "Grave"("Grave_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_Subscription_id_fkey" FOREIGN KEY ("Subscription_id") REFERENCES "SubscriptionPlan"("Subscription_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_Flower_id_fkey" FOREIGN KEY ("Flower_id") REFERENCES "Flowers"("flower_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_User_Id_fkey" FOREIGN KEY ("User_Id") REFERENCES "User"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;
