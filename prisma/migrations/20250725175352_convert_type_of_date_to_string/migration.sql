-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeadPersonProfile" (
    "profile_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "owner_id" TEXT NOT NULL,
    "name" TEXT,
    "profile_image" TEXT,
    "background_image" TEXT,
    "born_date" TEXT,
    "death_date" TEXT,
    "memorial_place" TEXT,
    "slug" TEXT NOT NULL,
    CONSTRAINT "DeadPersonProfile_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DeadPersonProfile" ("background_image", "born_date", "death_date", "memorial_place", "name", "owner_id", "profile_id", "profile_image", "slug") SELECT "background_image", "born_date", "death_date", "memorial_place", "name", "owner_id", "profile_id", "profile_image", "slug" FROM "DeadPersonProfile";
DROP TABLE "DeadPersonProfile";
ALTER TABLE "new_DeadPersonProfile" RENAME TO "DeadPersonProfile";
CREATE UNIQUE INDEX "DeadPersonProfile_slug_key" ON "DeadPersonProfile"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
