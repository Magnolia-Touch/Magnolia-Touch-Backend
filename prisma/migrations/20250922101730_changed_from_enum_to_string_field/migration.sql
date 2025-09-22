/*
  Warnings:

  - You are about to alter the column `relationship` on the `Family` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Family` MODIFY `relationship` VARCHAR(191) NOT NULL;
