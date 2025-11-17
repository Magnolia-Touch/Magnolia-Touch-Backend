/*
  Warnings:

  - A unique constraint covering the columns `[deadPersonProfiles]` on the table `Biography` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Biography_deadPersonProfiles_key` ON `Biography`(`deadPersonProfiles`);
