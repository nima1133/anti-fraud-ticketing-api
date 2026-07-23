import { IdempotencyService } from '../idempotencyService';

const idempotencyService = new IdempotencyService();

const tx = {
  booking: {
    findUnique: jest.fn(),
  },
} as any;

describe('Idempotency', () => {
  test('should return null when no booking exists for the provided idempotency key', async () => {
    tx.booking.findUnique.mockResolvedValue(null);

    const result = await idempotencyService.checkIdempotency(tx, {
      userId: 1,
      eventId: 1,
      quantity: 1,
      idempotencyKey: 'key-123',
    });

    expect(result).toBeNull();

    expect(tx.booking.findUnique).toHaveBeenCalledWith({
      where: {
        idempotencyKey: 'key-123',
      },
    });
  });

  test('should return the existing booking when the request data matches the original request', async () => {
    const booking = {
      id: 1,
      userId: 1,
      eventId: 1,
      quantity: 2,
      idempotencyKey: 'key-123',
    };

    tx.booking.findUnique.mockResolvedValue(booking);

    const result = await idempotencyService.checkIdempotency(tx, {
      userId: 1,
      eventId: 1,
      quantity: 2,
      idempotencyKey: 'key-123',
    });

    expect(result).toEqual(booking);

    expect(tx.booking.findUnique).toHaveBeenCalledWith({
      where: {
        idempotencyKey: 'key-123',
      },
    });
  });

  test('should throw an AppError when the idempotency key is reused with different request data', async () => {
    tx.booking.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      eventId: 1,
      quantity: 2,
      idempotencyKey: 'key-123',
    });

    await expect(
      idempotencyService.checkIdempotency(tx, {
        userId: 1,
        eventId: 1,
        quantity: 3, 
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow(
      'Idempotency key already used with different request data',
    );

    expect(tx.booking.findUnique).toHaveBeenCalledWith({
      where: {
        idempotencyKey: 'key-123',
      },
    });
  });
});
