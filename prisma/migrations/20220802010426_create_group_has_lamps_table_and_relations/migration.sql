-- CreateTable
CREATE TABLE `group_has_lamps` (
    `lampGroupId` INTEGER NOT NULL,
    `lampId` INTEGER NOT NULL,

    PRIMARY KEY (`lampGroupId`, `lampId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `group_has_lamps` ADD CONSTRAINT `group_has_lamps_lampGroupId_fkey` FOREIGN KEY (`lampGroupId`) REFERENCES `lamp_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_has_lamps` ADD CONSTRAINT `group_has_lamps_lampId_fkey` FOREIGN KEY (`lampId`) REFERENCES `lamps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
