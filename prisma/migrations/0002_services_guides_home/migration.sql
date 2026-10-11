-- AlterTable
ALTER TABLE `Destination` ADD COLUMN `bestMonths` JSON NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `entryInfo` TEXT NULL,
    ADD COLUMN `focalX` INTEGER NULL,
    ADD COLUMN `focalY` INTEGER NULL,
    ADD COLUMN `isInternational` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Package` ADD COLUMN `bestMonths` JSON NULL,
    ADD COLUMN `budgetBand` VARCHAR(191) NULL,
    ADD COLUMN `tripType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Inquiry` ADD COLUMN `assigneeId` VARCHAR(191) NULL,
    ADD COLUMN `refId` VARCHAR(191) NULL,
    ADD COLUMN `serviceId` VARCHAR(191) NULL,
    ADD COLUMN `source` VARCHAR(191) NULL,
    MODIFY `type` ENUM('GENERAL', 'TRIP_PLAN', 'PACKAGE', 'DESTINATION', 'SERVICE') NOT NULL DEFAULT 'GENERAL',
    MODIFY `status` ENUM('NEW', 'IN_PROGRESS', 'QUOTED', 'CONTACTED', 'CLOSED') NOT NULL DEFAULT 'NEW';

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `shortDescription` TEXT NULL,
    `longDescription` TEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `coverImageAlt` VARCHAR(191) NULL,
    `processSteps` JSON NULL,
    `faqs` JSON NULL,
    `linkedPackageSlugs` JSON NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_slug_key`(`slug`),
    INDEX `Service_published_order_idx`(`published`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TripType` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `coverImageAlt` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TripType_slug_key`(`slug`),
    INDEX `TripType_published_order_idx`(`published`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuidePost` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `body` TEXT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'General',
    `coverImage` VARCHAR(191) NULL,
    `coverImageAlt` VARCHAR(191) NULL,
    `readingMinutes` INTEGER NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuidePost_slug_key`(`slug`),
    INDEX `GuidePost_published_createdAt_idx`(`published`, `createdAt`),
    INDEX `GuidePost_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GalleryItem` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'General',
    `caption` VARCHAR(191) NULL,
    `destinationId` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GalleryItem_category_order_idx`(`category`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeSection` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `config` JSON NULL,

    UNIQUE INDEX `HomeSection_key_key`(`key`),
    INDEX `HomeSection_enabled_order_idx`(`enabled`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Destination_isInternational_idx` ON `Destination`(`isInternational`);

-- CreateIndex
CREATE UNIQUE INDEX `Inquiry_refId_key` ON `Inquiry`(`refId`);

-- CreateIndex
CREATE INDEX `Inquiry_source_idx` ON `Inquiry`(`source`);

-- AddForeignKey
ALTER TABLE `Inquiry` ADD CONSTRAINT `Inquiry_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GalleryItem` ADD CONSTRAINT `GalleryItem_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

