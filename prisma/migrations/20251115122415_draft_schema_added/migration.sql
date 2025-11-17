-- AlterTable
ALTER TABLE `Biography` ADD COLUMN `deadPersonProfileDraftProfile_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Events` ADD COLUMN `deadPersonProfileDraftProfile_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Family` ADD COLUMN `deadPersonProfileDraftProfile_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Gallery` ADD COLUMN `deadPersonProfileDraftProfile_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `SocialLinks` ADD COLUMN `deadPersonProfileDraftProfile_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `DeadPersonProfileDraft` (
    `profile_id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `profile_image` VARCHAR(191) NULL,
    `background_image` VARCHAR(191) NULL,
    `born_date` VARCHAR(191) NULL,
    `death_date` VARCHAR(191) NULL,
    `memorial_place` VARCHAR(191) NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT false,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DeadPersonProfileDraft_slug_key`(`slug`),
    PRIMARY KEY (`profile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialLinksDraft` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `socialMediaName` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventsDraft` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` VARCHAR(191) NULL,
    `event` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BiographyDraft` (
    `biography_id` INTEGER NOT NULL AUTO_INCREMENT,
    `discription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`biography_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GalleryDraft` (
    `gallery_id` INTEGER NOT NULL AUTO_INCREMENT,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`gallery_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FamilyDraft` (
    `family_id` INTEGER NOT NULL AUTO_INCREMENT,
    `relationship` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`family_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SocialLinks` ADD CONSTRAINT `SocialLinks_deadPersonProfileDraftProfile_id_fkey` FOREIGN KEY (`deadPersonProfileDraftProfile_id`) REFERENCES `DeadPersonProfileDraft`(`profile_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Events` ADD CONSTRAINT `Events_deadPersonProfileDraftProfile_id_fkey` FOREIGN KEY (`deadPersonProfileDraftProfile_id`) REFERENCES `DeadPersonProfileDraft`(`profile_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Biography` ADD CONSTRAINT `Biography_deadPersonProfileDraftProfile_id_fkey` FOREIGN KEY (`deadPersonProfileDraftProfile_id`) REFERENCES `DeadPersonProfileDraft`(`profile_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gallery` ADD CONSTRAINT `Gallery_deadPersonProfileDraftProfile_id_fkey` FOREIGN KEY (`deadPersonProfileDraftProfile_id`) REFERENCES `DeadPersonProfileDraft`(`profile_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Family` ADD CONSTRAINT `Family_deadPersonProfileDraftProfile_id_fkey` FOREIGN KEY (`deadPersonProfileDraftProfile_id`) REFERENCES `DeadPersonProfileDraft`(`profile_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeadPersonProfileDraft` ADD CONSTRAINT `DeadPersonProfileDraft_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `User`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialLinksDraft` ADD CONSTRAINT `SocialLinksDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventsDraft` ADD CONSTRAINT `EventsDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BiographyDraft` ADD CONSTRAINT `BiographyDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GalleryDraft` ADD CONSTRAINT `GalleryDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FamilyDraft` ADD CONSTRAINT `FamilyDraft_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;
