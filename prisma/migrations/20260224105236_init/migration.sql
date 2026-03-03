-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_userId_fkey`;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
