/*
  Warnings:

  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `memoryProfileId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_productId_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_userCustomer_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_shippingAddressId_fkey`;

-- DropIndex
DROP INDEX `orders_shippingAddressId_fkey` ON `orders`;

-- AlterTable
ALTER TABLE `DeadPersonProfile` ADD COLUMN `is_paid` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `church_id` INTEGER NULL,
    ADD COLUMN `is_paid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `memoryProfileId` VARCHAR(191) NOT NULL,
    MODIFY `shippingAddressId` INTEGER NULL;

-- DropTable
DROP TABLE `order_items`;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shippingAddressId_fkey` FOREIGN KEY (`shippingAddressId`) REFERENCES `UserAddress`(`deli_address_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_church_id_fkey` FOREIGN KEY (`church_id`) REFERENCES `Church`(`church_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_memoryProfileId_fkey` FOREIGN KEY (`memoryProfileId`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;
