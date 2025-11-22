-- AlterTable
ALTER TABLE `products` ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'Software',
    ADD COLUMN `details` TEXT NULL,
    ADD COLUMN `videoUrl` VARCHAR(191) NULL;
