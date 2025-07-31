-- CreateTable
CREATE TABLE "Validator" (
    "validator_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "owner_id" TEXT NOT NULL,
    "deadpersonprofileslug" TEXT NOT NULL,
    "is_scanned" BOOLEAN NOT NULL DEFAULT true
);
