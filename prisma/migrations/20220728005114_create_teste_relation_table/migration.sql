-- CreateTable
CREATE TABLE `TesteRelation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(191) NOT NULL,
    `testeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TesteRelation` ADD CONSTRAINT `TesteRelation_testeId_fkey` FOREIGN KEY (`testeId`) REFERENCES `Teste`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
