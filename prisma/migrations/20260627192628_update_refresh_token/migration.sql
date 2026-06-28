/*
  Warnings:

  - You are about to drop the column `userID` on the `RefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refreshToken]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userID_fkey";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "userID",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_refreshToken_key" ON "RefreshToken"("refreshToken");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
