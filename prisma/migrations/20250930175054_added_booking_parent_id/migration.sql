-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `bkng_parent_id` VARCHAR(191) NULL,
    ADD COLUMN `totalAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
