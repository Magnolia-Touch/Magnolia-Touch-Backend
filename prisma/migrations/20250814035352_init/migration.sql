-- CreateTable
CREATE TABLE `User` (
    `customer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `Phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',

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
    `short_Description` VARCHAR(191) NOT NULL,
    `detailed_description` VARCHAR(191) NULL,
    `company_guarantee` VARCHAR(191) NULL,
    `order_ids` INTEGER NULL,

    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Services` (
    `services_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `discription` VARCHAR(191) NOT NULL,

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
CREATE TABLE `Orders` (
    `Order_id` INTEGER NOT NULL AUTO_INCREMENT,
    `User_id` INTEGER NOT NULL,

    UNIQUE INDEX `Orders_User_id_key`(`User_id`),
    PRIMARY KEY (`Order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderedProducts` (
    `orderedproduct_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_item_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,

    PRIMARY KEY (`orderedproduct_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(191) NOT NULL,
    `User_id` INTEGER NOT NULL,
    `parent_order_id` INTEGER NOT NULL,
    `Order_Status` VARCHAR(191) NULL,
    `Total_Amount` DOUBLE NOT NULL,
    `Payment_Details` VARCHAR(191) NOT NULL,
    `Tracking_Details` VARCHAR(191) NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `OrderItems_order_id_key`(`order_id`),
    UNIQUE INDEX `OrderItems_parent_order_id_key`(`parent_order_id`),
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
    `church_address` VARCHAR(191) NOT NULL,
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
    `date1` DATETIME(3) NOT NULL,
    `date2` DATETIME(3) NULL,
    `Flower_id` INTEGER NOT NULL,
    `booking_date` DATETIME(3) NOT NULL,
    `next_cleaning_date` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL,
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
    `name` VARCHAR(191) NULL,
    `profile_image` VARCHAR(191) NULL,
    `background_image` VARCHAR(191) NULL,
    `born_date` VARCHAR(191) NULL,
    `death_date` VARCHAR(191) NULL,
    `memorial_place` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DeadPersonProfile_slug_key`(`slug`),
    PRIMARY KEY (`profile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Biography` (
    `biography_id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_caption_of_life` VARCHAR(191) NULL,
    `life_summary` VARCHAR(191) NULL,
    `personality_lifevalue` VARCHAR(191) NULL,
    `impact_on_others` VARCHAR(191) NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`biography_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gallery` (
    `gallery_id` INTEGER NOT NULL AUTO_INCREMENT,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`gallery_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Photos` (
    `photo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `gallery_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`photo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Videos` (
    `video_id` INTEGER NOT NULL AUTO_INCREMENT,
    `gallery_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`video_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Links` (
    `link_id` INTEGER NOT NULL AUTO_INCREMENT,
    `gallery_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`link_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Family` (
    `family_id` INTEGER NOT NULL AUTO_INCREMENT,
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
CREATE TABLE `Parents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Siblings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cousins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Friends` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Spouse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NieceAndNephew` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Childrens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GrandChildrens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GrandParents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GreatGrandParents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deadPersonProfiles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserAddress` ADD CONSTRAINT `UserAddress_userCustomer_id_fkey` FOREIGN KEY (`userCustomer_id`) REFERENCES `User`(`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingAddress` ADD CONSTRAINT `BillingAddress_userCustomer_id_fkey` FOREIGN KEY (`userCustomer_id`) REFERENCES `User`(`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_order_ids_fkey` FOREIGN KEY (`order_ids`) REFERENCES `Orders`(`Order_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`cartId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Products`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_User_id_fkey` FOREIGN KEY (`User_id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderedProducts` ADD CONSTRAINT `OrderedProducts_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Products`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderedProducts` ADD CONSTRAINT `OrderedProducts_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `OrderItems`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItems` ADD CONSTRAINT `OrderItems_User_id_fkey` FOREIGN KEY (`User_id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_Flower_id_fkey` FOREIGN KEY (`Flower_id`) REFERENCES `Flowers`(`flower_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reviews` ADD CONSTRAINT `Reviews_User_Id_fkey` FOREIGN KEY (`User_Id`) REFERENCES `User`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeadPersonProfile` ADD CONSTRAINT `DeadPersonProfile_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `User`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Biography` ADD CONSTRAINT `Biography_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gallery` ADD CONSTRAINT `Gallery_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photos` ADD CONSTRAINT `Photos_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photos` ADD CONSTRAINT `Photos_gallery_id_fkey` FOREIGN KEY (`gallery_id`) REFERENCES `Gallery`(`gallery_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Videos` ADD CONSTRAINT `Videos_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Videos` ADD CONSTRAINT `Videos_gallery_id_fkey` FOREIGN KEY (`gallery_id`) REFERENCES `Gallery`(`gallery_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Links` ADD CONSTRAINT `Links_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Links` ADD CONSTRAINT `Links_gallery_id_fkey` FOREIGN KEY (`gallery_id`) REFERENCES `Gallery`(`gallery_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Family` ADD CONSTRAINT `Family_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestBook` ADD CONSTRAINT `GuestBook_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestBookItems` ADD CONSTRAINT `GuestBookItems_guestbook_id_fkey` FOREIGN KEY (`guestbook_id`) REFERENCES `GuestBook`(`guestbook_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parents` ADD CONSTRAINT `Parents_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parents` ADD CONSTRAINT `Parents_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Siblings` ADD CONSTRAINT `Siblings_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Siblings` ADD CONSTRAINT `Siblings_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cousins` ADD CONSTRAINT `Cousins_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cousins` ADD CONSTRAINT `Cousins_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friends` ADD CONSTRAINT `Friends_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friends` ADD CONSTRAINT `Friends_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Spouse` ADD CONSTRAINT `Spouse_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Spouse` ADD CONSTRAINT `Spouse_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NieceAndNephew` ADD CONSTRAINT `NieceAndNephew_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NieceAndNephew` ADD CONSTRAINT `NieceAndNephew_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Childrens` ADD CONSTRAINT `Childrens_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Childrens` ADD CONSTRAINT `Childrens_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pets` ADD CONSTRAINT `Pets_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pets` ADD CONSTRAINT `Pets_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrandChildrens` ADD CONSTRAINT `GrandChildrens_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrandChildrens` ADD CONSTRAINT `GrandChildrens_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrandParents` ADD CONSTRAINT `GrandParents_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrandParents` ADD CONSTRAINT `GrandParents_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GreatGrandParents` ADD CONSTRAINT `GreatGrandParents_deadPersonProfiles_fkey` FOREIGN KEY (`deadPersonProfiles`) REFERENCES `DeadPersonProfile`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GreatGrandParents` ADD CONSTRAINT `GreatGrandParents_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `Family`(`family_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
