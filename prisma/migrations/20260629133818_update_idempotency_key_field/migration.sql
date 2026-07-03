/*
  Warnings:

  - You are about to drop the column `status` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `IdempotencyKey` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "status",
ADD COLUMN     "IdempotencyKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- DropEnum
DROP TYPE "BookingStatus";
