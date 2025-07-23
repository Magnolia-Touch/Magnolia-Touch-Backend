/*
  Warnings:

  - You are about to drop the `Grave` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `Grave_id` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `church_id` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Grave";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "booking_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name_on_memorial" TEXT NOT NULL,
    "plot_no" TEXT,
    "User_id" INTEGER NOT NULL,
    "church_id" INTEGER NOT NULL,
    "Subscription_id" INTEGER NOT NULL,
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
INSERT INTO "new_Booking" ("Flower_id", "Subscription_id", "User_id", "booking_date", "booking_id", "date1", "date2", "is_bought", "name_on_memorial", "next_cleaning_date", "plot_no", "status") SELECT "Flower_id", "Subscription_id", "User_id", "booking_date", "booking_id", "date1", "date2", "is_bought", "name_on_memorial", "next_cleaning_date", "plot_no", "status" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_Church" (
    "church_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "church_name" TEXT NOT NULL,
    "church_address" TEXT NOT NULL,
    "userCustomer_id" INTEGER,
    CONSTRAINT "Church_userCustomer_id_fkey" FOREIGN KEY ("userCustomer_id") REFERENCES "User" ("customer_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Church" ("church_address", "church_id", "church_name") SELECT "church_address", "church_id", "church_name" FROM "Church";
DROP TABLE "Church";
ALTER TABLE "new_Church" RENAME TO "Church";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
