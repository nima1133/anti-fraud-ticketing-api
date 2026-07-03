-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'AVAILABLE';

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
