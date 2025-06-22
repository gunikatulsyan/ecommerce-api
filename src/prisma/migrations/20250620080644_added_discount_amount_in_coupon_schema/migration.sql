/*
  Warnings:

  - You are about to alter the column `discount_value` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Coupon` ADD COLUMN `discount_amount` DOUBLE NULL,
    MODIFY `discount_value` DOUBLE NOT NULL;
