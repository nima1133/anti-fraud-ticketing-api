import { prisma } from '../../../lib/prisma';
import { AuditService } from '../../audit/auditService';
import { FraudService } from '../../fraud/fraudService';
import { IdempotencyService } from '../../idempotency/idempotencyService';
import { BookingService } from '../bookingService';
import { AuditAction } from '../../generated/prisma/enums';

const bookingService = new BookingService();

jest.mock('../../queues/payment.queue', () => ({
  paymentQueue: {
    add: jest.fn(),
  },
}));
import { paymentQueue } from '../../queues/payment.queue';

const tx = {
  $queryRaw: jest.fn(),
  event: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  booking: {
    update: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findFirst : jest.fn()
  },
} as any;

const data = {
  userId: 1,
  eventId: 1,
  quantity: 2,
  idempotencyKey: 'test-idempotency-key',
};
beforeEach(() => {
  jest.clearAllMocks();

  tx.event.findUnique.mockReset();
  tx.event.update.mockReset();
  tx.booking.update.mockReset();
  tx.booking.create.mockReset();
  tx.$queryRaw.mockReset();
  tx.$queryRaw.mockResolvedValue(undefined);

  jest
    .spyOn(FraudService.prototype, 'checkPurchaseLimit')
    .mockResolvedValue(null);

  jest
    .spyOn(FraudService.prototype, 'checkVelocity')
    .mockResolvedValue(undefined);

  jest.spyOn(AuditService.prototype, 'log').mockResolvedValue(undefined);

  jest
    .spyOn(IdempotencyService.prototype, 'checkIdempotency')
    .mockResolvedValue(null);

  jest
    .spyOn(prisma, '$transaction')
    .mockImplementation(async (callback: any) => {
      return callback(tx);
    });
});

describe('BookingService.reserveTicket', () => {
  test('should return the existing booking when the idempotency key has already been used', async () => {
    const existingBooking = {
      id: 1,
      userId: 1,
      eventId: 1,
      quantity: 2,
      idempotencyKey: 'test-idempotency-key',
      status: 'HOLD',
    };

    jest
      .spyOn(IdempotencyService.prototype, 'checkIdempotency')
      .mockResolvedValue(existingBooking as any);

    const result = await bookingService.reserveTicket(data);

    expect(result).toEqual(existingBooking);
    expect(tx.booking.create).not.toHaveBeenCalled();
  });

  test('should throw an AppError when the event does not exist', async () => {
    tx.event.findUnique.mockResolvedValue(null);

    await expect(bookingService.reserveTicket(data)).rejects.toThrow(
      'event not found',
    );

    expect(tx.booking.create).not.toHaveBeenCalled();
  });
  test('should throw an AppError when the requested ticket quantity exceeds the remaining capacity', async () => {
    tx.event.findUnique.mockResolvedValue({
      id: 1,
      capacity: 10,
      sold: 9,
    });

    await expect(bookingService.reserveTicket(data)).rejects.toThrow(
      'not enough ticket for your request',
    );

    expect(tx.booking.create).not.toHaveBeenCalled();
  });

  test('should create a new booking when the request is valid', async () => {
    tx.event.findUnique.mockResolvedValue({
      id: 1,
      capacity: 100,
      sold: 10,
    });

    const newBooking = {
      id: 1,
      userId: data.userId,
      eventId: data.eventId,
      quantity: data.quantity,
      idempotencyKey: data.idempotencyKey,
      status: 'HOLD',
    };

    tx.booking.create.mockResolvedValue(newBooking);

    const result = await bookingService.reserveTicket(data);

    expect(result).toEqual(newBooking);
  });
  test('should increment the sold ticket count when a booking is created', async () => {
    tx.event.findUnique.mockResolvedValue({
      id: 1,
      capacity: 100,
      sold: 10,
    });

    tx.booking.create.mockResolvedValue({
      id: 1,
      userId: data.userId,
      eventId: data.eventId,
      quantity: data.quantity,
      status: 'HOLD',
    });

    await bookingService.reserveTicket(data);

    expect(tx.event.update).toHaveBeenCalledWith({
      where: { id: data.eventId },
      data: {
        sold: { increment: data.quantity },
      },
    });
  });
  test('should add a payment timeout job to the queue after creating a booking', async () => {
    tx.event.findUnique.mockResolvedValue({
      id: 1,
      capacity: 100,
      sold: 10,
    });

    const newBooking = {
      id: 1,
      userId: data.userId,
      eventId: data.eventId,
      quantity: data.quantity,
      idempotencyKey: data.idempotencyKey,
      status: 'HOLD',
    };

    tx.booking.create.mockResolvedValue(newBooking);

    await bookingService.reserveTicket(data);

    expect(paymentQueue.add).toHaveBeenCalledWith(
      'payment-timeout',
      {
        bookingId: newBooking.id,
      },
      {
        delay: 10 * 60 * 1000,
      },
    );
  });
  test('should create an audit log after successfully creating a booking', async () => {
    tx.event.findUnique.mockResolvedValue({
      id: 1,
      capacity: 100,
      sold: 10,
    });

    const newBooking = {
      id: 1,
      userId: data.userId,
      eventId: data.eventId,
      quantity: data.quantity,
      idempotencyKey: data.idempotencyKey,
      status: 'HOLD',
    };

    tx.booking.create.mockResolvedValue(newBooking);

    await bookingService.reserveTicket(data);

    expect(AuditService.prototype.log).toHaveBeenCalledWith(tx, {
      action: AuditAction.BOOKING_CREATED,
      userId: data.userId,
      entityType: 'BOOKING',
      entityId: newBooking.id,
    });
  });
});

describe('BookingService.deleteReservation', () => {
  test('should throw an AppError when the reservation does not exist', async () => {
    tx.booking.findUnique.mockResolvedValue(null);

    await expect(bookingService.deleteReservation(1, 1)).rejects.toThrow(
      'reserve not found',
    );

    expect(tx.booking.update).not.toHaveBeenCalled();
    expect(tx.booking.delete).not.toHaveBeenCalled();
    expect(tx.event.update).not.toHaveBeenCalled();
  });
  test('should throw an AppError when the deleted quantity is less than or equal to zero', async () => {
    tx.booking.findUnique.mockResolvedValue({
      id: 1,
      eventId: 1,
      quantity: 2,
    });

    await expect(bookingService.deleteReservation(1, 0)).rejects.toThrow(
      'invalid quantity',
    );

    expect(tx.booking.update).not.toHaveBeenCalled();
    expect(tx.booking.delete).not.toHaveBeenCalled();
    expect(tx.event.update).not.toHaveBeenCalled();
  });
  test('should throw an AppError when the deleted quantity exceeds the reserved quantity', async () => {
    tx.booking.findUnique.mockResolvedValue({
      id: 1,
      eventId: 1,
      quantity: 2,
    });

    await expect(bookingService.deleteReservation(1, 3)).rejects.toThrow(
      'cannot delete more than reserved',
    );

    expect(tx.booking.update).not.toHaveBeenCalled();
    expect(tx.booking.delete).not.toHaveBeenCalled();
    expect(tx.event.update).not.toHaveBeenCalled();
  });
  test('should decrement the booking quantity when only part of the reservation is deleted', async () => {
    tx.booking.findUnique.mockResolvedValue({
      id: 1,
      eventId: 1,
      quantity: 5,
    });

    await bookingService.deleteReservation(1, 2);

    expect(tx.booking.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        quantity: { decrement: 2 },
      },
    });

    expect(tx.booking.delete).not.toHaveBeenCalled();

    expect(tx.event.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        sold: { decrement: 2 },
      },
    });
  });
  test('should delete the booking when all reserved tickets are removed', async () => {
    tx.booking.findUnique.mockResolvedValue({
      id: 1,
      eventId: 1,
      quantity: 2,
    });

    await bookingService.deleteReservation(1, 2);

    expect(tx.booking.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(tx.booking.update).not.toHaveBeenCalled();

    expect(tx.event.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        sold: { decrement: 2 },
      },
    });
  });
  test('should decrement the sold ticket count after deleting reserved tickets', async () => {
    tx.booking.findUnique.mockResolvedValue({
      id: 1,
      eventId: 1,
      quantity: 5,
    });

    await bookingService.deleteReservation(1, 2);

    expect(tx.event.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        sold: { decrement: 2 },
      },
    });
  });
});

describe('BookingService.getTicketMe', () => {
test('should return all bookings that belong to the specified user', async () => {
  const bookings = [
    {
      id: 1,
      userId: 1,
      eventId: 1,
      quantity: 2,
      status: 'HOLD',
    },
    {
      id: 2,
      userId: 1,
      eventId: 2,
      quantity: 1,
      status: 'CONFIRMED',
    },
  ];

  jest.spyOn(prisma.booking, 'findMany').mockResolvedValue(bookings as any);

  const result = await bookingService.getTicketMe(1);

  expect(result).toEqual(bookings);
});});

