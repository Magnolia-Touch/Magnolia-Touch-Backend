-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BillingAddress" (
    "bill_address_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "town_or_city" TEXT NOT NULL,
    "country" TEXT,
    "postcode" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userCustomer_id" INTEGER,
    CONSTRAINT "BillingAddress_userCustomer_id_fkey" FOREIGN KEY ("userCustomer_id") REFERENCES "User" ("customer_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BillingAddress" ("Name", "bill_address_id", "country", "email", "phone", "postcode", "street", "town_or_city") SELECT "Name", "bill_address_id", "country", "email", "phone", "postcode", "street", "town_or_city" FROM "BillingAddress";
DROP TABLE "BillingAddress";
ALTER TABLE "new_BillingAddress" RENAME TO "BillingAddress";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
