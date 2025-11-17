/*
  Warnings:

  - You are about to drop the column `deadPersonProfileDraftProfile_id` on the `Biography` table. All the data in the column will be lost.
  - You are about to drop the column `deadPersonProfileDraftProfile_id` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `deadPersonProfileDraftProfile_id` on the `Family` table. All the data in the column will be lost.
  - You are about to drop the column `deadPersonProfileDraftProfile_id` on the `Gallery` table. All the data in the column will be lost.
  - You are about to drop the column `deadPersonProfileDraftProfile_id` on the `SocialLinks` table. All the data in the column will be lost.
  - You are about to drop the `BiographyDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeadPersonProfileDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventsDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FamilyDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GalleryDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocialLinksDraft` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Biography` DROP FOREIGN KEY `Biography_deadPersonProfileDraftProfile_id_fkey`;

-- DropForeignKey
ALTER TABLE `BiographyDraft` DROP FOREIGN KEY `BiographyDraft_deadPersonProfiles_fkey`;

-- DropForeignKey
ALTER TABLE `DeadPersonProfileDraft` DROP FOREIGN KEY `DeadPersonProfileDraft_owner_id_fkey`;

-- DropForeignKey
ALTER TABLE `Events` DROP FOREIGN KEY `Events_deadPersonProfileDraftProfile_id_fkey`;

-- DropForeignKey
ALTER TABLE `EventsDraft` DROP FOREIGN KEY `EventsDraft_deadPersonProfiles_fkey`;

-- DropForeignKey
ALTER TABLE `Family` DROP FOREIGN KEY `Family_deadPersonProfileDraftProfile_id_fkey`;

-- DropForeignKey
ALTER TABLE `FamilyDraft` DROP FOREIGN KEY `FamilyDraft_deadPersonProfiles_fkey`;

-- DropForeignKey
ALTER TABLE `Gallery` DROP FOREIGN KEY `Gallery_deadPersonProfileDraftProfile_id_fkey`;

-- DropForeignKey
ALTER TABLE `GalleryDraft` DROP FOREIGN KEY `GalleryDraft_deadPersonProfiles_fkey`;

-- DropForeignKey
ALTER TABLE `SocialLinks` DROP FOREIGN KEY `SocialLinks_deadPersonProfileDraftProfile_id_fkey`;

-- DropForeignKey
ALTER TABLE `SocialLinksDraft` DROP FOREIGN KEY `SocialLinksDraft_deadPersonProfiles_fkey`;

-- DropIndex
DROP INDEX `Biography_deadPersonProfileDraftProfile_id_fkey` ON `Biography`;

-- DropIndex
DROP INDEX `Events_deadPersonProfileDraftProfile_id_fkey` ON `Events`;

-- DropIndex
DROP INDEX `Family_deadPersonProfileDraftProfile_id_fkey` ON `Family`;

-- DropIndex
DROP INDEX `Gallery_deadPersonProfileDraftProfile_id_fkey` ON `Gallery`;

-- DropIndex
DROP INDEX `SocialLinks_deadPersonProfileDraftProfile_id_fkey` ON `SocialLinks`;

-- AlterTable
ALTER TABLE `Biography` DROP COLUMN `deadPersonProfileDraftProfile_id`;

-- AlterTable
ALTER TABLE `Events` DROP COLUMN `deadPersonProfileDraftProfile_id`;

-- AlterTable
ALTER TABLE `Family` DROP COLUMN `deadPersonProfileDraftProfile_id`;

-- AlterTable
ALTER TABLE `Gallery` DROP COLUMN `deadPersonProfileDraftProfile_id`;

-- AlterTable
ALTER TABLE `SocialLinks` DROP COLUMN `deadPersonProfileDraftProfile_id`;

-- DropTable
DROP TABLE `BiographyDraft`;

-- DropTable
DROP TABLE `DeadPersonProfileDraft`;

-- DropTable
DROP TABLE `EventsDraft`;

-- DropTable
DROP TABLE `FamilyDraft`;

-- DropTable
DROP TABLE `GalleryDraft`;

-- DropTable
DROP TABLE `SocialLinksDraft`;
