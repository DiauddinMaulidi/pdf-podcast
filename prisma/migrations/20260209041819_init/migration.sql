/*
  Warnings:

  - You are about to drop the column `content` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `minType` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `chats` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mineType` to the `chats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chats` DROP COLUMN `content`,
    DROP COLUMN `minType`,
    DROP COLUMN `title`,
    ADD COLUMN `fileName` VARCHAR(191) NOT NULL,
    ADD COLUMN `fileSize` INTEGER NOT NULL,
    ADD COLUMN `mineType` VARCHAR(191) NOT NULL;
