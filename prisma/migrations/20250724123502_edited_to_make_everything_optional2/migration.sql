/*
  Warnings:

  - You are about to drop the column `profile_id` on the `GuestBook` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuestBook" (
    "guestbook_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deadPersonProfileProfile_id" INTEGER,
    CONSTRAINT "GuestBook_deadPersonProfileProfile_id_fkey" FOREIGN KEY ("deadPersonProfileProfile_id") REFERENCES "DeadPersonProfile" ("profile_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GuestBook" ("deadPersonProfileProfile_id", "guestbook_id") SELECT "deadPersonProfileProfile_id", "guestbook_id" FROM "GuestBook";
DROP TABLE "GuestBook";
ALTER TABLE "new_GuestBook" RENAME TO "GuestBook";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
