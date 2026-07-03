import { AppError } from "../utils/appError";
import { Prisma } from '../generated/prisma/client';
import { createTicketDto } from "../booking/bookingService";

export class IdempotencyService{
  async checkIdempotency(
  tx: Prisma.TransactionClient,
  data: createTicketDto
) {
  const existingBooking = await tx.booking.findUnique({
    where: {
      idempotencyKey: data.idempotencyKey,
    },
  });

  if (!existingBooking) return null;

  const isSameRequest =
    existingBooking.userId === data.userId &&
    existingBooking.eventId === data.eventId &&
    existingBooking.quantity === data.quantity;

  if (!isSameRequest) {
    throw new AppError(
      "Idempotency key already used with different request data",
      409
    );
  }

  return existingBooking;
}
}