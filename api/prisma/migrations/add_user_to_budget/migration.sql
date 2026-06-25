-- AlterTable
ALTER TABLE `Budget` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Budget_userId_idx` ON `Budget`(`userId`);

-- DropIndex (old unique constraint)
DROP INDEX `Budget_month_year_categoryId_key` ON `Budget`;

-- CreateIndex (new unique constraint with userId)
CREATE UNIQUE INDEX `Budget_month_year_categoryId_userId_key` ON `Budget`(`month`, `year`, `categoryId`, `userId`);

-- CreateIndex (categoryId index, was previously @@index)
CREATE INDEX `Budget_categoryId_idx` ON `Budget`(`categoryId`);

-- AddForeignKey
ALTER TABLE `Budget` ADD CONSTRAINT `Budget_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
