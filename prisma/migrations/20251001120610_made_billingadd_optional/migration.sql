-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_billingAddressId_fkey`;

-- DropIndex
DROP INDEX `orders_billingAddressId_fkey` ON `orders`;

-- AlterTable
ALTER TABLE `orders` MODIFY `billingAddressId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_billingAddressId_fkey` FOREIGN KEY (`billingAddressId`) REFERENCES `BillingAddress`(`bill_address_id`) ON DELETE SET NULL ON UPDATE CASCADE;
