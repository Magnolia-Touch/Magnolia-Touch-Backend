/*
  Warnings:

  - You are about to drop the column `Order_Status` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `Payment_Details` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `Total_Amount` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `Tracking_Details` on the `Orders` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "OrderedProducts" (
    "orderedproduct_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_item_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    CONSTRAINT "OrderedProducts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products" ("product_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderedProducts_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "OrderItems" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_id" TEXT NOT NULL,
    "User_id" INTEGER NOT NULL,
    "parent_order_id" INTEGER NOT NULL,
    "Order_Status" TEXT,
    "Total_Amount" REAL NOT NULL,
    "Payment_Details" TEXT NOT NULL,
    "Tracking_Details" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "OrderItems_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Orders" (
    "Order_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "User_id" INTEGER NOT NULL,
    CONSTRAINT "Orders_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Orders" ("Order_id", "User_id") SELECT "Order_id", "User_id" FROM "Orders";
DROP TABLE "Orders";
ALTER TABLE "new_Orders" RENAME TO "Orders";
CREATE UNIQUE INDEX "Orders_User_id_key" ON "Orders"("User_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "OrderItems_order_id_key" ON "OrderItems"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItems_parent_order_id_key" ON "OrderItems"("parent_order_id");
