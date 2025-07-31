-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuestBookItems" (
    "guestbookitems_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guestbook_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "photo_upload" TEXT,
    "date" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GuestBookItems_guestbook_id_fkey" FOREIGN KEY ("guestbook_id") REFERENCES "GuestBook" ("guestbook_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GuestBookItems" ("date", "email", "first_name", "guestbook_id", "guestbookitems_id", "last_name", "message", "phone", "photo_upload") SELECT "date", "email", "first_name", "guestbook_id", "guestbookitems_id", "last_name", "message", "phone", "photo_upload" FROM "GuestBookItems";
DROP TABLE "GuestBookItems";
ALTER TABLE "new_GuestBookItems" RENAME TO "GuestBookItems";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
