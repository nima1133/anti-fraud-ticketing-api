import { prisma } from '../../lib/prisma';
import { ApiFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/appError';

export interface createTicketDto {
  userId: number;
  eventId: number;
  quantity: number;
}
export class BookingService {
  //USER
  async reserveTicket(data: createTicketDto) {
   return  await prisma.$transaction(async (tx) => {
      // 1. Find event

      await tx.$queryRaw`
  SELECT id
  FROM "Event"
  WHERE id = ${data.eventId}
  FOR UPDATE
`;

      const event = await tx.event.findUnique({
        where: {
          id: data.eventId,
        },
      });
      if (!event) {
        throw new AppError('event not found', 404);
      }
      // 2. Calculate sold tickets
      // SUM(quantity)
      // 3. remaining =
      // event.capacity - sold

      const remainingTicket = event.capacity - event.sold;

      // 4. if requested > remaining
      // throw error
      if (data.quantity > remainingTicket) {
        throw new AppError('not enough ticket for your request', 400);
      }
      await tx.event.update({
        where: {
          id: data.eventId,
        },
        data: {
          sold: { increment: data.quantity },
        },
      });

      // 5. create booking
     return await tx.booking.create({
        data,
      });
    });
  } 
  async deleteReservation(bookingId: number, deletedNumber: number) {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
    SELECT id
    FROM "Booking"
    WHERE id = ${bookingId}
    FOR UPDATE
  `;

      const reserve = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!reserve) {
        throw new AppError('reserve not found', 404);
      }

      if (deletedNumber <= 0) {
        throw new AppError('invalid quantity', 400);
      }

      if (deletedNumber > reserve.quantity) {
        throw new AppError('cannot delete more than reserved', 400);
      }
      const safeDelete = Math.min(deletedNumber, reserve.quantity);
      if (reserve.quantity > deletedNumber) {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            quantity: { decrement: safeDelete },
          },
        });
      } else {
        await tx.booking.delete({
          where: { id: bookingId },
        });
      }
      await tx.event.update({
        where: { id: reserve.eventId },
        data: {
          sold: { decrement: safeDelete },
        },
      });
    });
  }
  async getTicketMe(userId: number) {
    const userReserve = await prisma.booking.findMany({
      where: {
        userId,
      },
    });
    return userReserve;
  }

  //ADMIN
async getAllTickets(eventId: number, query: any) {
  const options = new ApiFeatures(query)
    .filter()
    .sort()
    .paginate()
    .build();

  return await prisma.booking.findMany({
    ...options,
    where: {
      eventId,
      ...options.where,
    },
  });
}
  async getTicket(bookingId: number) {
    return await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
  }
}
