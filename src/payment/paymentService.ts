import { prisma } from '../../lib/prisma';
import { AppError } from '../utils/appError';

export class PaymentService {
  async completePayment(bookingId: number, paymentStatus: boolean) {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.status === 'CONFIRMED') {
        throw new AppError('Booking is already paid', 409);
      }

      if (paymentStatus) {
        const result = await tx.booking.updateMany({
          where: {
            id: bookingId,
            status: 'HOLD',
          },
          data: {
            status: 'CONFIRMED',
          },
        });

        if (result.count === 0) {
          throw new AppError('Booking is no longer in HOLD status', 409);
        }

        return {
          bookingId,
          status: 'CONFIRMED',
        };
      }

      const result = await tx.booking.updateMany({
        where: {
          id: bookingId,
          status: 'HOLD',
        },
        data: {
          status: 'CANCELLED',
        },
      });

      if (result.count === 0) {
        throw new AppError('Booking is no longer in HOLD status', 409);
      }

      await tx.event.update({
        where: {
          id: booking.eventId,
        },
        data: {
          sold: {
            decrement: booking.quantity,
          },
        
        },
      });
      return {
        bookingId,
        status: 'CANCELLED',
      };
    });
  }
}
