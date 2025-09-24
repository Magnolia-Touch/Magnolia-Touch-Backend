-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_Subscription_id_fkey`;

-- DropIndex
DROP INDEX `Booking_Subscription_id_fkey` ON `Booking`;

-- AlterTable
ALTER TABLE `Booking` MODIFY `Subscription_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_Subscription_id_fkey` FOREIGN KEY (`Subscription_id`) REFERENCES `SubscriptionPlan`(`Subscription_id`) ON DELETE SET NULL ON UPDATE CASCADE;
