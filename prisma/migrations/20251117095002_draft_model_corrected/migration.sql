/*
  Warnings:

  - You are about to drop the column `discription` on the `Biography` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Biography` DROP COLUMN `discription`,
    ADD COLUMN `description` TEXT NULL;
