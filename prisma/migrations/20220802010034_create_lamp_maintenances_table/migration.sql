-- CreateTable
CREATE TABLE `lamp_maintenances` (
    `lampId` INTEGER NOT NULL,
    `maintenanceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`lampId`, `maintenanceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lamp_maintenances` ADD CONSTRAINT `lamp_maintenances_lampId_fkey` FOREIGN KEY (`lampId`) REFERENCES `lamps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lamp_maintenances` ADD CONSTRAINT `lamp_maintenances_maintenanceId_fkey` FOREIGN KEY (`maintenanceId`) REFERENCES `maintenances`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
