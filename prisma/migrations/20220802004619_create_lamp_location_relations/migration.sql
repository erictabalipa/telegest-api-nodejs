/*
  Warnings:

  - Added the required column `lampId` to the `lamp_locations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lamp_locations` ADD COLUMN `lampId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `lamp_locations` ADD CONSTRAINT `lamp_locations_lampId_fkey` FOREIGN KEY (`lampId`) REFERENCES `lamps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
