-- AlterTable
ALTER TABLE `Biography` MODIFY `discription` TEXT NULL;

-- AlterTable
ALTER TABLE `Events` MODIFY `year` VARCHAR(191) NULL,
    MODIFY `event` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Family` MODIFY `relationship` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NULL;
