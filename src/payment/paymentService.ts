import { prisma } from '../../lib/prisma';
import { AuditService } from '../audit/auditService';
import { AuditAction } from '../generated/prisma/enums';
import { AppError } from '../utils/appError';

const auditService = new AuditService();

export class PaymentService {
  async completePayment(bookingId: number, paymentStatus: boolean) {
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
      SELECT id
      FROM "Booking"
      WHERE id = ${bookingId}
      FOR UPDATE
      `;
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.status === 'CONFIRMED') {
        throw new AppError('Booking is already paid', 409);
      }
      if (booking.status === 'CANCELLED') {
        throw new AppError('Booking has already been cancelled', 409);
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

        await auditService.log(tx, {
          action: AuditAction.BOOKING_CONFIRMED,
          userId: booking.userId,
          entityType: 'BOOKING',
          entityId: bookingId,
        });

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

      await auditService.log(tx, {
        action: AuditAction.BOOKING_CANCELLED,
        userId: booking.userId,
        entityType: 'BOOKING',
        entityId: bookingId,
      });

      return {
        bookingId,
        status: 'CANCELLED',
      };
    });
  }
}
