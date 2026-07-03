/*
  Warnings:

  - A unique constraint covering the columns `[IdempotencyKey]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Booking_IdempotencyKey_key" ON "Booking"("IdempotencyKey");
