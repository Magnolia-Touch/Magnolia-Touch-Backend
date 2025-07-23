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
INSERT INTO "new_Booking" ("Flower_id", "Subscription_id", "User_id", "booking_date", "booking_id", "church_id", "date1", "date2", "is_bought", "name_on_memorial", "next_cleaning_date", "plot_no", "status") SELECT "Flower_id", "Subscription_id", "User_id", "booking_date", "booking_id", "church_id", "date1", "date2", "is_bought", "name_on_memorial", "next_cleaning_date", "plot_no", "status" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
