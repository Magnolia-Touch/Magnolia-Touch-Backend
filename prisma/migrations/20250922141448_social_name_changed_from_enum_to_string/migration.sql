/*
  Warnings:

  - Made the column `socialMediaName` on table `SocialLinks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `SocialLinks` MODIFY `socialMediaName` VARCHAR(191) NOT NULL;
