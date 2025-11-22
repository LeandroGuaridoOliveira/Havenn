/*
  Warnings:

  - A unique constraint covering the columns `[licenseKey]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `licenseKey` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `orders_licenseKey_key` ON `orders`(`licenseKey`);
