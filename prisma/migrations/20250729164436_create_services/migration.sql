/*
  Warnings:

  - You are about to drop the column `Service_Name` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - Added the required column `discription` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Services" (
    "services_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "discription" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubscriptionPlan" (
    "Subscription_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discription" TEXT NOT NULL,
    "Subscription_name" TEXT NOT NULL,
    "Frequency" INTEGER NOT NULL,
    "Price" TEXT NOT NULL
);
INSERT INTO "new_SubscriptionPlan" ("Frequency", "Price", "Subscription_id", "Subscription_name") SELECT "Frequency", "Price", "Subscription_id", "Subscription_name" FROM "SubscriptionPlan";
DROP TABLE "SubscriptionPlan";
ALTER TABLE "new_SubscriptionPlan" RENAME TO "SubscriptionPlan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
