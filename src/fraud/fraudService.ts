import { Prisma } from '../generated/prisma/client';
import { createTicketDto } from '../booking/bookingService';
import { AppError } from '../utils/appError';
import { prisma } from '../../lib/prisma';

export class FraudService {
  async checkPurchaseLimit(
    tx: Prisma.TransactionClient,
    data: createTicketDto,
  ) {
    await tx.$queryRaw` 
      SELECT *
      FROM "Booking"
      WHERE "userId"=${data.userId}      
      AND "eventId"=${data.eventId}
      FOR UPDATE`;

    const booking = await tx.booking.findUnique({
      where: {
        userId_eventId: { userId: data.userId, eventId: data.eventId },
      },
    });
    const currentQuantity = booking?.quantity ?? 0;
    const totalQuantity = currentQuantity + data.quantity;
    if (totalQuantity > 4) {
      throw new AppError('Purchase limit exceeded', 400);
    }
    return booking;
  }
  async checkVelocity(tx: Prisma.TransactionClient, userId: number) {
    const count = await tx.booking.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 10000),
        },
      },
    });
    if (count >= 5) {
      throw new AppError('Too many booking attempts', 429);
    }
  }

}
