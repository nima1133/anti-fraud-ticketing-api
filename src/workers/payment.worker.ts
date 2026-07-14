import { Worker } from 'bullmq';
import { prisma } from '../../lib/prisma';
import { connection } from '../../lib/redis';
import { AuditAction } from '../generated/prisma/enums';
import { AuditService } from '../audit/auditService';

const auditService = new AuditService();
const worker = new Worker(
  'payment-timeout',
  async (job) => {

    const { bookingId } = job.data;
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id 
        FROM "Booking"
        WHERE id = ${bookingId}
        FOR UPDATE`;

      const booking = await tx.booking.findUnique({
        where: {
          id: bookingId,
        },
      });

      if (!booking) return;

      const result = await tx.booking.updateMany({
        where: {
          id: bookingId,
          status: 'HOLD',
        },
        data: {
          status: 'EXPIRED',
        },
      });

      if (result.count === 0) {
        return;
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
        action: AuditAction.BOOKING_EXPIRED,
        userId: booking.userId,
        entityType: 'BOOKING',
        entityId: bookingId,
      });
    });
  },
  { connection },
);

worker.on('ready', () => {
  console.log('Payment worker is ready');
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});
