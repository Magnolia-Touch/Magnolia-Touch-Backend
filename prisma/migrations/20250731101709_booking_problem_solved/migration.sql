/*
  Warnings:

  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `booking_id` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `booking_ids` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booking_ids" TEXT NOT NULL,
    "name_on_memorial" TEXT NOT NULL,
    "plot_no" TEXT,
    "User_id" INTEGER NOT NULL,
    "church_id" INTEGER NOT NULL,
    "Subscription_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "date1" DATETIME NOT NULL,
    "date2" DATETIME,
    "Flower_id" INTEGER NOT NULL,
    "booking_date" DATETIME NOT NULL,
    "next_cleaning_date" DATETIME,
    "status" TEXT NOT NULL,
    "is_bought" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Booking_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "Church" ("church_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_Subscription_id_fkey" FOREIGN KEY ("Subscription_id") REFERENCES "SubscriptionPlan" ("Subscription_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_Flower_id_fkey" FOREIGN KEY ("Flower_id") REFERENCES "Flowers" ("flower_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("Flower_id", "Subscription_id", "User_id", "amount", "booking_date", "church_id", "date1", "date2", "is_bought", "name_on_memorial", "next_cleaning_date", "plot_no", "status") SELECT "Flower_id", "Subscription_id", "User_id", "amount", "booking_date", "church_id", "date1", "date2", "is_bought", "name_on_memorial", "next_cleaning_date", "plot_no", "status" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_booking_ids_key" ON "Booking"("booking_ids");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
