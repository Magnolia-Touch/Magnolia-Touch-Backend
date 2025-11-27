/*
  Warnings:

  - A unique constraint covering the columns `[filename]` on the table `QrCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `QrCode_filename_key` ON `QrCode`(`filename`);
