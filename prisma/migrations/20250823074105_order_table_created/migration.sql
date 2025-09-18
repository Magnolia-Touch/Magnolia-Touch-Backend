/*
  Warnings:

  - You are about to drop the column `order_ids` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the `OrderItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderedProducts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderItems` DROP FOREIGN KEY `OrderItems_User_id_fkey`;

-- DropForeignKey
ALTER TABLE `OrderedProducts` DROP FOREIGN KEY `OrderedProducts_order_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `OrderedProducts` DROP FOREIGN KEY `OrderedProducts_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `Orders` DROP FOREIGN KEY `Orders_User_id_fkey`;

-- DropForeignKey
ALTER TABLE `Products` DROP FOREIGN KEY `Products_order_ids_fkey`;

-- DropIndex
DROP INDEX `Products_order_ids_fkey` ON `Products`;

-- AlterTable
ALTER TABLE `Products` DROP COLUMN `order_ids`;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('USER', 'ADMIN', 'DELIVERY') NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE `OrderItems`;

-- DropTable
DROP TABLE `OrderedProducts`;

-- DropTable
DROP TABLE `Orders`;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `User_id` INTEGER NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `shippingCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `taxAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,
    `shippingAddressId` INTEGER NOT NULL,
    `billingAddressId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `tracking_details` VARCHAR(191) NULL,
    `delivery_agent_id` INTEGER NULL,
    `deliveryAgentProfileId` INTEGER NULL,

    UNIQUE INDEX `orders_User_id_key`(`User_id`),
    UNIQUE INDEX `orders_orderNumber_key`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `userCustomer_id` INTEGER NULL,

    UNIQUE INDEX `order_items_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryAgentProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryagent_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_User_id_fkey` FOREIGN KEY (`User_id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shippingAddressId_fkey` FOREIGN KEY (`shippingAddressId`) REFERENCES `UserAddress`(`deli_address_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_billingAddressId_fkey` FOREIGN KEY (`billingAddressId`) REFERENCES `BillingAddress`(`bill_address_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_deliveryAgentProfileId_fkey` FOREIGN KEY (`deliveryAgentProfileId`) REFERENCES `DeliveryAgentProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Products`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_userCustomer_id_fkey` FOREIGN KEY (`userCustomer_id`) REFERENCES `User`(`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryAgentProfile` ADD CONSTRAINT `DeliveryAgentProfile_deliveryagent_id_fkey` FOREIGN KEY (`deliveryagent_id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
