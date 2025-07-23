/*
  Warnings:

  - Added the required column `name_on_memorial` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_Phone_key";

-- CreateTable
CREATE TABLE "UserAddress" (
    "deli_address_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "town_or_city" TEXT NOT NULL,
    "country" TEXT,
    "postcode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userCustomer_id" INTEGER,
    CONSTRAINT "UserAddress_userCustomer_id_fkey" FOREIGN KEY ("userCustomer_id") REFERENCES "User" ("customer_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillingAddress" (
    "bill_address_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "town_or_city" TEXT NOT NULL,
    "country" TEXT,
    "postcode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Church" (
    "church_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "church_name" TEXT NOT NULL,
    "church_address" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "booking_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name_on_memorial" TEXT NOT NULL,
    "plot_no" TEXT,
    "User_id" INTEGER NOT NULL,
    "Grave_id" INTEGER NOT NULL,
    "Subscription_id" INTEGER NOT NULL,
    "date1" DATETIME NOT NULL,
    "date2" DATETIME,
    "Flower_id" INTEGER NOT NULL,
    "booking_date" DATETIME NOT NULL,
    "next_cleaning_date" DATETIME,
    "status" TEXT NOT NULL,
    "is_bought" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Booking_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_Grave_id_fkey" FOREIGN KEY ("Grave_id") REFERENCES "Grave" ("Grave_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_Subscription_id_fkey" FOREIGN KEY ("Subscription_id") REFERENCES "SubscriptionPlan" ("Subscription_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_Flower_id_fkey" FOREIGN KEY ("Flower_id") REFERENCES "Flowers" ("flower_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("Flower_id", "Grave_id", "Subscription_id", "User_id", "booking_date", "booking_id", "date1", "date2", "next_cleaning_date", "status") SELECT "Flower_id", "Grave_id", "Subscription_id", "User_id", "booking_date", "booking_id", "date1", "date2", "next_cleaning_date", "status" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
