-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Flowers" (
    "flower_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Price" TEXT NOT NULL,
    "Description" TEXT,
    "in_stock" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Flowers" ("Description", "Name", "Price", "flower_id", "in_stock") SELECT "Description", "Name", "Price", "flower_id", "in_stock" FROM "Flowers";
DROP TABLE "Flowers";
ALTER TABLE "new_Flowers" RENAME TO "Flowers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
