-- CreateTable
CREATE TABLE `statuses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dimmer` INTEGER NOT NULL,
    `operation_mode` INTEGER NOT NULL,
    `lampId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenances_has_usable_objects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `unit_of_measurement` VARCHAR(191) NOT NULL,
    `instalationId` INTEGER NOT NULL,
    `usableObjectId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `statuses` ADD CONSTRAINT `statuses_lampId_fkey` FOREIGN KEY (`lampId`) REFERENCES `lamps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenances_has_usable_objects` ADD CONSTRAINT `maintenances_has_usable_objects_instalationId_fkey` FOREIGN KEY (`instalationId`) REFERENCES `maintenances`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenances_has_usable_objects` ADD CONSTRAINT `maintenances_has_usable_objects_usableObjectId_fkey` FOREIGN KEY (`usableObjectId`) REFERENCES `usable_objects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
