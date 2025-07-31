/*
  Warnings:

  - You are about to drop the column `email` on the `GuestBook` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `GuestBook` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `GuestBook` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `GuestBook` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `GuestBook` table. All the data in the column will be lost.
  - You are about to drop the column `photo_upload` on the `GuestBook` table. All the data in the column will be lost.
  - Added the required column `slug` to the `DeadPersonProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "GuestBookItems" (
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Biography" (
    "biography_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile_id" INTEGER NOT NULL,
    "description" TEXT,
    CONSTRAINT "Biography_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "DeadPersonProfile" ("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Biography" ("biography_id", "description", "profile_id") SELECT "biography_id", "description", "profile_id" FROM "Biography";
DROP TABLE "Biography";
ALTER TABLE "new_Biography" RENAME TO "Biography";
CREATE TABLE "new_DeadPersonProfile" (
    "profile_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "profile_image" TEXT,
    "background_image" TEXT,
    "born_date" DATETIME,
    "death_date" DATETIME,
    "memorial_place" TEXT,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_DeadPersonProfile" ("background_image", "born_date", "death_date", "memorial_place", "name", "profile_id", "profile_image") SELECT "background_image", "born_date", "death_date", "memorial_place", "name", "profile_id", "profile_image" FROM "DeadPersonProfile";
DROP TABLE "DeadPersonProfile";
ALTER TABLE "new_DeadPersonProfile" RENAME TO "DeadPersonProfile";
CREATE UNIQUE INDEX "DeadPersonProfile_slug_key" ON "DeadPersonProfile"("slug");
CREATE TABLE "new_GuestBook" (
    "guestbook_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile_id" INTEGER NOT NULL,
    "deadPersonProfileProfile_id" INTEGER,
    CONSTRAINT "GuestBook_deadPersonProfileProfile_id_fkey" FOREIGN KEY ("deadPersonProfileProfile_id") REFERENCES "DeadPersonProfile" ("profile_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GuestBook" ("guestbook_id", "profile_id") SELECT "guestbook_id", "profile_id" FROM "GuestBook";
DROP TABLE "GuestBook";
ALTER TABLE "new_GuestBook" RENAME TO "GuestBook";
CREATE TABLE "new_Links" (
    "link_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT,
    CONSTRAINT "Links_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Links" ("gallery_id", "link_id", "url") SELECT "gallery_id", "link_id", "url" FROM "Links";
DROP TABLE "Links";
ALTER TABLE "new_Links" RENAME TO "Links";
CREATE TABLE "new_Photos" (
    "photo_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT,
    CONSTRAINT "Photos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Photos" ("gallery_id", "photo_id", "url") SELECT "gallery_id", "photo_id", "url" FROM "Photos";
DROP TABLE "Photos";
ALTER TABLE "new_Photos" RENAME TO "Photos";
CREATE TABLE "new_Videos" (
    "video_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT,
    CONSTRAINT "Videos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Videos" ("gallery_id", "url", "video_id") SELECT "gallery_id", "url", "video_id" FROM "Videos";
DROP TABLE "Videos";
ALTER TABLE "new_Videos" RENAME TO "Videos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
