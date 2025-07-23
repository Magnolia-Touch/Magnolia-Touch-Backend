-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Products" (
    "product_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "box_contains" TEXT,
    "short_Description" TEXT NOT NULL,
    "detailed_description" TEXT,
    "company_guarantee" TEXT,
    "order_ids" INTEGER,
    CONSTRAINT "Products_order_ids_fkey" FOREIGN KEY ("order_ids") REFERENCES "Orders" ("Order_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Products" ("box_contains", "company_guarantee", "detailed_description", "order_ids", "price", "product_id", "product_name", "short_Description") SELECT "box_contains", "company_guarantee", "detailed_description", "order_ids", "price", "product_id", "product_name", "short_Description" FROM "Products";
DROP TABLE "Products";
ALTER TABLE "new_Products" RENAME TO "Products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
