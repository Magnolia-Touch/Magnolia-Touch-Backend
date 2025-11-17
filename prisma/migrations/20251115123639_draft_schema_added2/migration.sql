-- DropForeignKey
ALTER TABLE `BiographyDraft` DROP FOREIGN KEY `BiographyDraft_deadPersonProfiles_fkey`;

-- DropForeignKey
ALTER TABLE `EventsDraft` DROP FOREIGN KEY `EventsDraft_deadPersonProfiles_fkey`;

-- DropForeignKey
ALTER TABLE `FamilyDraft` DROP FOREIGN KEY `FamilyDraft_deadPersonProfiles_fkey`;

-- DropForeignKey
ALTER TABLE `GalleryDraft` DROP FOREIGN KEY `GalleryDraft_deadPersonProfiles_fkey`;

-- DropForeignKey
ALTER TABLE `SocialLinksDraft` DROP FOREIGN KEY `SocialLinksDraft_deadPersonProfiles_fkey`;

-- DropIndex
DROP INDEX `BiographyDraft_deadPersonProfiles_fkey` ON `BiographyDraft`;

-- DropIndex
DROP INDEX `EventsDraft_deadPersonProfiles_fkey` ON `EventsDraft`;

-- DropIndex
DROP INDEX `FamilyDraft_deadPersonProfiles_fkey` ON `FamilyDraft`;

-- DropIndex
DROP INDEX `GalleryDraft_deadPersonProfiles_fkey` ON `GalleryDraft`;

-- DropIndex
DROP INDEX `SocialLinksDraft_deadPersonProfiles_fkey` ON `SocialLinksDraft`;

-- AddForeignKey
ALTER TABLE `SocialLinksDraft` ADD CONSTRAINT `SocialLinksDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfileDraft`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventsDraft` ADD CONSTRAINT `EventsDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfileDraft`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BiographyDraft` ADD CONSTRAINT `BiographyDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfileDraft`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GalleryDraft` ADD CONSTRAINT `GalleryDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfileDraft`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FamilyDraft` ADD CONSTRAINT `FamilyDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfileDraft`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;
