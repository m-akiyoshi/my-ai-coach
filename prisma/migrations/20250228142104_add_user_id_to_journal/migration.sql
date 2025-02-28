/*
  Warnings:

  - Added the required column `userId` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "isChatbot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "emotion" DROP NOT NULL;
