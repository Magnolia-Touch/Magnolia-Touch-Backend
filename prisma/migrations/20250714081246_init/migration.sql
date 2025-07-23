-- CreateTable
CREATE TABLE "User" (
    "customer_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "Phone" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Products" (
    "product_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "box_contains" TEXT,
    "short_Description" TEXT NOT NULL,
    "detailed_description" TEXT,
    "company_guarantee" TEXT,
    "order_ids" INTEGER NOT NULL,
    CONSTRAINT "Products_order_ids_fkey" FOREIGN KEY ("order_ids") REFERENCES "Orders" ("Order_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Orders" (
    "Order_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "User_id" INTEGER NOT NULL,
    "Order_Status" TEXT NOT NULL,
    "Total_Amount" REAL NOT NULL,
    "Payment_Details" TEXT NOT NULL,
    "Tracking_Details" TEXT NOT NULL,
    CONSTRAINT "Orders_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductDimension" (
    "dimension_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dimension" TEXT NOT NULL,
    "productsProduct_id" INTEGER,
    CONSTRAINT "ProductDimension_productsProduct_id_fkey" FOREIGN KEY ("productsProduct_id") REFERENCES "Products" ("product_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grave" (
    "Grave_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "User_id" INTEGER NOT NULL,
    "Address" TEXT NOT NULL,
    CONSTRAINT "Grave_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "Subscription_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Service_Name" TEXT NOT NULL,
    "Subscription_name" TEXT NOT NULL,
    "Frequency" INTEGER NOT NULL,
    "Price" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Flowers" (
    "flower_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Price" REAL NOT NULL,
    "Description" TEXT,
    "in_stock" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Booking" (
    "booking_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "User_id" INTEGER NOT NULL,
    "Grave_id" INTEGER NOT NULL,
    "Subscription_id" INTEGER NOT NULL,
    "date1" DATETIME NOT NULL,
    "date2" DATETIME,
    "Flower_id" INTEGER NOT NULL,
    "booking_date" DATETIME NOT NULL,
    "next_cleaning_date" DATETIME,
    "status" TEXT NOT NULL,
    CONSTRAINT "Booking_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_Grave_id_fkey" FOREIGN KEY ("Grave_id") REFERENCES "Grave" ("Grave_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_Subscription_id_fkey" FOREIGN KEY ("Subscription_id") REFERENCES "SubscriptionPlan" ("Subscription_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_Flower_id_fkey" FOREIGN KEY ("Flower_id") REFERENCES "Flowers" ("flower_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reviews" (
    "Review_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "User_Id" INTEGER NOT NULL,
    "Review_Description" TEXT NOT NULL,
    "Rating" INTEGER NOT NULL,
    CONSTRAINT "Reviews_User_Id_fkey" FOREIGN KEY ("User_Id") REFERENCES "User" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_Phone_key" ON "User"("Phone");
