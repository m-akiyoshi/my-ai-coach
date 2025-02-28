/*
  Warnings:

  - You are about to drop the column `text` on the `JournalEntry` table. All the data in the column will be lost.
  - Added the required column `content` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "text",
ADD COLUMN     "content" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isChatbot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
