/*
  Warnings:

  - Made the column `email` on table `GuestBookItems` required. This step will fail if there are existing NULL values in that column.
  - Made the column `first_name` on table `GuestBookItems` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_name` on table `GuestBookItems` required. This step will fail if there are existing NULL values in that column.
  - Made the column `message` on table `GuestBookItems` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `GuestBookItems` required. This step will fail if there are existing NULL values in that column.
  - Made the column `url` on table `Photos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `url` on table `Videos` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuestBookItems" (
    "guestbookitems_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guestbook_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "photo_upload" TEXT,
    CONSTRAINT "GuestBookItems_guestbook_id_fkey" FOREIGN KEY ("guestbook_id") REFERENCES "GuestBook" ("guestbook_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GuestBookItems" ("email", "first_name", "guestbook_id", "guestbookitems_id", "last_name", "message", "phone", "photo_upload") SELECT "email", "first_name", "guestbook_id", "guestbookitems_id", "last_name", "message", "phone", "photo_upload" FROM "GuestBookItems";
DROP TABLE "GuestBookItems";
ALTER TABLE "new_GuestBookItems" RENAME TO "GuestBookItems";
CREATE TABLE "new_Photos" (
    "photo_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Photos_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Photos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Photos" ("deadPersonProfiles", "gallery_id", "photo_id", "url") SELECT "deadPersonProfiles", "gallery_id", "photo_id", "url" FROM "Photos";
DROP TABLE "Photos";
ALTER TABLE "new_Photos" RENAME TO "Photos";
CREATE TABLE "new_Videos" (
    "video_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Videos_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Videos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Videos" ("deadPersonProfiles", "gallery_id", "url", "video_id") SELECT "deadPersonProfiles", "gallery_id", "url", "video_id" FROM "Videos";
DROP TABLE "Videos";
ALTER TABLE "new_Videos" RENAME TO "Videos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
