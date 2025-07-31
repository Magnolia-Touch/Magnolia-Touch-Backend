/*
  Warnings:

  - You are about to drop the column `description` on the `Biography` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Biography" (
    "biography_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "short_caption_of_life" TEXT,
    "life_summary" TEXT,
    "personality_lifevalue" TEXT,
    "impact_on_others" TEXT,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Biography_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Biography" ("biography_id", "deadPersonProfiles") SELECT "biography_id", "deadPersonProfiles" FROM "Biography";
DROP TABLE "Biography";
ALTER TABLE "new_Biography" RENAME TO "Biography";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
