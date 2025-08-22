/*
  Warnings:

  - You are about to drop the column `date1` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `date2` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `next_cleaning_date` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `first_cleaning_date` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_of_subscription_years` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Flowers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `features` to the `Services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `date1`,
    DROP COLUMN `date2`,
    DROP COLUMN `next_cleaning_date`,
    ADD COLUMN `anniversary_date` DATETIME(3) NULL,
    ADD COLUMN `first_cleaning_date` DATETIME(3) NOT NULL,
    ADD COLUMN `no_of_subscription_years` INTEGER NOT NULL,
    ADD COLUMN `second_cleaning_date` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Flowers` ADD COLUMN `image` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Products` MODIFY `short_Description` TEXT NOT NULL,
    MODIFY `detailed_description` TEXT NULL,
    MODIFY `company_guarantee` TEXT NULL;

-- AlterTable
ALTER TABLE `Services` ADD COLUMN `features` VARCHAR(191) NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NOT NULL;
