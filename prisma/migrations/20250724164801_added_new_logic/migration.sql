/*
  Warnings:

  - You are about to drop the column `profile_id` on the `Biography` table. All the data in the column will be lost.
  - You are about to drop the column `profile_id` on the `Family` table. All the data in the column will be lost.
  - You are about to drop the column `profile_id` on the `Gallery` table. All the data in the column will be lost.
  - You are about to drop the column `deadPersonProfileProfile_id` on the `GuestBook` table. All the data in the column will be lost.
  - Added the required column `deadPersonProfiles` to the `Biography` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Childrens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Cousins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Family` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Gallery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `GrandChildrens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `GrandParents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `GreatGrandParents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `GuestBook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `NieceAndNephew` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Parents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Pets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Siblings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Spouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadPersonProfiles` to the `Videos` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Biography" (
    "biography_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Biography_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Biography" ("biography_id", "description") SELECT "biography_id", "description" FROM "Biography";
DROP TABLE "Biography";
ALTER TABLE "new_Biography" RENAME TO "Biography";
CREATE TABLE "new_Childrens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Childrens_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Childrens_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Childrens" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "Childrens";
DROP TABLE "Childrens";
ALTER TABLE "new_Childrens" RENAME TO "Childrens";
CREATE TABLE "new_Cousins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Cousins_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Cousins_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cousins" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "Cousins";
DROP TABLE "Cousins";
ALTER TABLE "new_Cousins" RENAME TO "Cousins";
CREATE TABLE "new_Family" (
    "family_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Family_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Family" ("family_id") SELECT "family_id" FROM "Family";
DROP TABLE "Family";
ALTER TABLE "new_Family" RENAME TO "Family";
CREATE TABLE "new_Friends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Friends_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friends_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Friends" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "Friends";
DROP TABLE "Friends";
ALTER TABLE "new_Friends" RENAME TO "Friends";
CREATE TABLE "new_Gallery" (
    "gallery_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Gallery_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Gallery" ("gallery_id") SELECT "gallery_id" FROM "Gallery";
DROP TABLE "Gallery";
ALTER TABLE "new_Gallery" RENAME TO "Gallery";
CREATE TABLE "new_GrandChildrens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "GrandChildrens_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GrandChildrens_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GrandChildrens" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "GrandChildrens";
DROP TABLE "GrandChildrens";
ALTER TABLE "new_GrandChildrens" RENAME TO "GrandChildrens";
CREATE TABLE "new_GrandParents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "GrandParents_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GrandParents_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GrandParents" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "GrandParents";
DROP TABLE "GrandParents";
ALTER TABLE "new_GrandParents" RENAME TO "GrandParents";
CREATE TABLE "new_GreatGrandParents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "GreatGrandParents_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GreatGrandParents_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GreatGrandParents" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "GreatGrandParents";
DROP TABLE "GreatGrandParents";
ALTER TABLE "new_GreatGrandParents" RENAME TO "GreatGrandParents";
CREATE TABLE "new_GuestBook" (
    "guestbook_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "GuestBook_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GuestBook" ("guestbook_id") SELECT "guestbook_id" FROM "GuestBook";
DROP TABLE "GuestBook";
ALTER TABLE "new_GuestBook" RENAME TO "GuestBook";
CREATE TABLE "new_Links" (
    "link_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Links_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Links_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Links" ("gallery_id", "link_id", "url") SELECT "gallery_id", "link_id", "url" FROM "Links";
DROP TABLE "Links";
ALTER TABLE "new_Links" RENAME TO "Links";
CREATE TABLE "new_NieceAndNephew" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "NieceAndNephew_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NieceAndNephew_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NieceAndNephew" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "NieceAndNephew";
DROP TABLE "NieceAndNephew";
ALTER TABLE "new_NieceAndNephew" RENAME TO "NieceAndNephew";
CREATE TABLE "new_Parents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Parents_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parents_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Parents" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "Parents";
DROP TABLE "Parents";
ALTER TABLE "new_Parents" RENAME TO "Parents";
CREATE TABLE "new_Pets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Pets_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pets_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pets" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "Pets";
DROP TABLE "Pets";
ALTER TABLE "new_Pets" RENAME TO "Pets";
CREATE TABLE "new_Photos" (
    "photo_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Photos_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Photos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Photos" ("gallery_id", "photo_id", "url") SELECT "gallery_id", "photo_id", "url" FROM "Photos";
DROP TABLE "Photos";
ALTER TABLE "new_Photos" RENAME TO "Photos";
CREATE TABLE "new_Siblings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Siblings_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Siblings_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Siblings" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "Siblings";
DROP TABLE "Siblings";
ALTER TABLE "new_Siblings" RENAME TO "Siblings";
CREATE TABLE "new_Spouse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Spouse_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Spouse_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Spouse" ("family_id", "id", "name") SELECT "family_id", "id", "name" FROM "Spouse";
DROP TABLE "Spouse";
ALTER TABLE "new_Spouse" RENAME TO "Spouse";
CREATE TABLE "new_Videos" (
    "video_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT,
    "deadPersonProfiles" TEXT NOT NULL,
    CONSTRAINT "Videos_deadPersonProfiles_fkey" FOREIGN KEY ("deadPersonProfiles") REFERENCES "DeadPersonProfile" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Videos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Videos" ("gallery_id", "url", "video_id") SELECT "gallery_id", "url", "video_id" FROM "Videos";
DROP TABLE "Videos";
ALTER TABLE "new_Videos" RENAME TO "Videos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
