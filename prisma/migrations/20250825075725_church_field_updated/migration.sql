/*
  Warnings:

  - Added the required column `city` to the `Church` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Church` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_Flower_id_fkey`;

-- DropIndex
DROP INDEX `Booking_Flower_id_fkey` ON `Booking`;

-- AlterTable
ALTER TABLE `Booking` MODIFY `Flower_id` INTEGER NULL,
    MODIFY `no_of_subscription_years` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Church` ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    MODIFY `church_address` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_Flower_id_fkey` FOREIGN KEY (`Flower_id`) REFERENCES `Flowers`(`flower_id`) ON DELETE SET NULL ON UPDATE CASCADE;
