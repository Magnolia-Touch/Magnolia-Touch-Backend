-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Validator" (
    "validator_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "owner_id" TEXT NOT NULL,
    "deadpersonprofileslug" TEXT NOT NULL,
    "is_scanned" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Validator_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Validator" ("deadpersonprofileslug", "is_scanned", "owner_id", "validator_id") SELECT "deadpersonprofileslug", "is_scanned", "owner_id", "validator_id" FROM "Validator";
DROP TABLE "Validator";
ALTER TABLE "new_Validator" RENAME TO "Validator";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
