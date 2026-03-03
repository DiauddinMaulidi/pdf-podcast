-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_chatId_fkey`;

-- DropForeignKey
ALTER TABLE `podcast` DROP FOREIGN KEY `Podcast_chatId_fkey`;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Podcast` ADD CONSTRAINT `Podcast_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
