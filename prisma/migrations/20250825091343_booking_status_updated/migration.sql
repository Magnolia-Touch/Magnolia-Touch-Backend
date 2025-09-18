/*
  Warnings:

  - You are about to alter the column `status` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Booking` MODIFY `status` ENUM('pending', 'confirmed', 'cleaned') NOT NULL DEFAULT 'pending';
