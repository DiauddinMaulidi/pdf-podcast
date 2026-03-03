/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the `chatsession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_sessionId_fkey`;

-- AlterTable
ALTER TABLE `messages` DROP COLUMN `audioUrl`,
    DROP COLUMN `sessionId`;

-- DropTable
DROP TABLE `chatsession`;
