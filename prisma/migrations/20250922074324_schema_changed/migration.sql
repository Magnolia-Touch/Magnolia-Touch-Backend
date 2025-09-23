-- CreateTable
CREATE TABLE `User` (
    `customer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `Phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'DELIVERY') NOT NULL DEFAULT 'USER',

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAddress` (
    `deli_address_id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `town_or_city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `postcode` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `userCustomer_id` INTEGER NULL,

    PRIMARY KEY (`deli_address_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillingAddress` (
    `bill_address_id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `town_or_city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `postcode` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `userCustomer_id` INTEGER NULL,

    PRIMARY KEY (`bill_address_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Products` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `box_contains` VARCHAR(191) NULL,
    `short_Description` TEXT NOT NULL,
    `detailed_description` TEXT NULL,
    `company_guarantee` TEXT NULL,

    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Services` (
    `services_id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `discription` VARCHAR(191) NOT NULL,
    `features` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`services_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `cartId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `total_amount` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`cartId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductDimension` (
    `dimension_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dimension` VARCHAR(191) NOT NULL,
    `productsProduct_id` INTEGER NULL,

    PRIMARY KEY (`dimension_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionPlan` (
    `Subscription_id` INTEGER NOT NULL AUTO_INCREMENT,
    `discription` VARCHAR(191) NOT NULL,
    `Subscription_name` VARCHAR(191) NOT NULL,
    `Frequency` INTEGER NOT NULL,
    `Price` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Subscription_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flowers` (
    `flower_id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `Price` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NULL,
    `in_stock` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`flower_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Church` (
    `church_id` INTEGER NOT NULL AUTO_INCREMENT,
    `church_name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `church_address` VARCHAR(191) NULL,
    `userCustomer_id` INTEGER NULL,

    PRIMARY KEY (`church_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_ids` VARCHAR(191) NOT NULL,
    `name_on_memorial` VARCHAR(191) NOT NULL,
    `plot_no` VARCHAR(191) NULL,
    `User_id` INTEGER NOT NULL,
    `church_id` INTEGER NOT NULL,
    `Subscription_id` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL DEFAULT 0,
    `first_cleaning_date` DATETIME(3) NOT NULL,
    `second_cleaning_date` DATETIME(3) NULL,
    `no_of_subscription_years` INTEGER NOT NULL DEFAULT 1,
    `Flower_id` INTEGER NULL,
    `booking_date` DATETIME(3) NOT NULL,
    `anniversary_date` DATETIME(3) NULL,
    `status` ENUM('pending', 'confirmed', 'cleaned') NOT NULL DEFAULT 'pending',
    `is_bought` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Booking_booking_ids_key`(`booking_ids`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reviews` (
    `Review_id` INTEGER NOT NULL AUTO_INCREMENT,
    `User_Id` INTEGER NOT NULL,
    `Review_Description` VARCHAR(191) NOT NULL,
    `Rating` INTEGER NOT NULL,

    PRIMARY KEY (`Review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeadPersonProfile` (
    `profile_id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `profile_image` VARCHAR(191) NULL,
    `background_image` VARCHAR(191) NULL,
    `born_date` VARCHAR(191) NOT NULL,
    `death_date` VARCHAR(191) NOT NULL,
    `memorial_place` VARCHAR(191) NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT false,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DeadPersonProfile_slug_key`(`slug`),
    PRIMARY KEY (`profile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialLinks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `socialMediaName` ENUM('FACEBOOK', 'INSTAGRAM', 'TWITTER', 'YOUTUBE') NULL,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` VARCHAR(191) NOT NULL,
    `event` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Biography` (
    `biography_id` INTEGER NOT NULL AUTO_INCREMENT,
    `discription` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`biography_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gallery` (
    `gallery_id` INTEGER NOT NULL AUTO_INCREMENT,
    `link` VARCHAR(191) NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`gallery_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Family` (
    `family_id` INTEGER NOT NULL AUTO_INCREMENT,
    `relationship` ENUM('Parents', 'Siblings', 'Cousins', 'Friends', 'Spouse', 'NieceAndNephew', 'Childrens', 'Pets', 'GrandChildrens', 'GrandParents', 'GreatGrandParents') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`family_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuestBook` (
    `guestbook_id` INTEGER NOT NULL AUTO_INCREMENT,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`guestbook_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuestBookItems` (
    `guestbookitems_id` INTEGER NOT NULL AUTO_INCREMENT,
    `guestbook_id` INTEGER NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `message` VARCHAR(191) NOT NULL,
    `photo_upload` VARCHAR(191) NULL,
    `date` VARCHAR(191) NOT NULL,
    `is_approved` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`guestbookitems_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `memoryProfileId` VARCHAR(191) NOT NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT false,
    `shippingAddressId` INTEGER NULL,
    `billingAddressId` INTEGER NOT NULL,
    `church_id` INTEGER NULL,
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
CREATE TABLE `DeliveryAgentProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryagent_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserAddress` ADD CONSTRAINT `UserAddress_userCustomer_id_fkey` FOREIGN KEY (`userCustomer_id`) REFERENCES `User`(`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingAddress` ADD CONSTRAINT `BillingAddress_userCustomer_id_fkey` FOREIGN KEY (`userCustomer_id`) REFERENCES `User`(`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`cartId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Products`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductDimension` ADD CONSTRAINT `ProductDimension_productsProduct_id_fkey` FOREIGN KEY (`productsProduct_id`) REFERENCES `Products`(`product_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Church` ADD CONSTRAINT `Church_userCustomer_id_fkey` FOREIGN KEY (`userCustomer_id`) REFERENCES `User`(`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_User_id_fkey` FOREIGN KEY (`User_id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_church_id_fkey` FOREIGN KEY (`church_id`) REFERENCES `Church`(`church_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_Subscription_id_fkey` FOREIGN KEY (`Subscription_id`) REFERENCES `SubscriptionPlan`(`Subscription_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_Flower_id_fkey` FOREIGN KEY (`Flower_id`) REFERENCES `Flowers`(`flower_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reviews` ADD CONSTRAINT `Reviews_User_Id_fkey` FOREIGN KEY (`User_Id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeadPersonProfile` ADD CONSTRAINT `DeadPersonProfile_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `User`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialLinks` ADD CONSTRAINT `SocialLinks_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Events` ADD CONSTRAINT `Events_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Biography` ADD CONSTRAINT `Biography_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gallery` ADD CONSTRAINT `Gallery_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Family` ADD CONSTRAINT `Family_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestBook` ADD CONSTRAINT `GuestBook_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestBookItems` ADD CONSTRAINT `GuestBookItems_guestbook_id_fkey` FOREIGN KEY (`guestbook_id`) REFERENCES `GuestBook`(`guestbook_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_User_id_fkey` FOREIGN KEY (`User_id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shippingAddressId_fkey` FOREIGN KEY (`shippingAddressId`) REFERENCES `UserAddress`(`deli_address_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_billingAddressId_fkey` FOREIGN KEY (`billingAddressId`) REFERENCES `BillingAddress`(`bill_address_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_church_id_fkey` FOREIGN KEY (`church_id`) REFERENCES `Church`(`church_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_memoryProfileId_fkey` FOREIGN KEY (`memoryProfileId`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_deliveryAgentProfileId_fkey` FOREIGN KEY (`deliveryAgentProfileId`) REFERENCES `DeliveryAgentProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryAgentProfile` ADD CONSTRAINT `DeliveryAgentProfile_deliveryagent_id_fkey` FOREIGN KEY (`deliveryagent_id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
