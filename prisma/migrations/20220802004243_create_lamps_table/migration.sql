-- CreateTable
CREATE TABLE `lamps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `instalationId` INTEGER NOT NULL,
    `lampModelId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lamps` ADD CONSTRAINT `lamps_instalationId_fkey` FOREIGN KEY (`instalationId`) REFERENCES `instalations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lamps` ADD CONSTRAINT `lamps_lampModelId_fkey` FOREIGN KEY (`lampModelId`) REFERENCES `lamp_models`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
