-- CreateTable
CREATE TABLE "DeadPersonProfile" (
    "profile_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "profile_image" TEXT,
    "background_image" TEXT,
    "born_date" DATETIME NOT NULL,
    "death_date" DATETIME NOT NULL,
    "memorial_place" TEXT
);

-- CreateTable
CREATE TABLE "Biography" (
    "biography_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Biography_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "DeadPersonProfile" ("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gallery" (
    "gallery_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile_id" INTEGER NOT NULL,
    CONSTRAINT "Gallery_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "DeadPersonProfile" ("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Photos" (
    "photo_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "Photos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Videos" (
    "video_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "Videos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Links" (
    "link_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gallery_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "Links_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "Gallery" ("gallery_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Family" (
    "family_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile_id" INTEGER NOT NULL,
    CONSTRAINT "Family_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "DeadPersonProfile" ("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuestBook" (
    "guestbook_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "photo_upload" TEXT,
    CONSTRAINT "GuestBook_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "DeadPersonProfile" ("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Parents_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Siblings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Siblings_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cousins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Cousins_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Friends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Friends_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Spouse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Spouse_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NieceAndNephew" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "NieceAndNephew_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Childrens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Childrens_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Pets_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrandChildrens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "GrandChildrens_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrandParents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "GrandParents_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GreatGrandParents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "family_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "GreatGrandParents_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "Family" ("family_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
