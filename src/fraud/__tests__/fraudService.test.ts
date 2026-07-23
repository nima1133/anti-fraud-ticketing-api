import { AuditService } from '../../audit/auditService';
import { AuditAction } from '../../generated/prisma/enums';
import { FraudService } from '../fraudService';

const fraudService = new FraudService();

const tx = {
  $queryRaw: jest.fn().mockResolvedValue(undefined),

  booking: {
    findUnique: jest.fn(),
    count: jest.fn(),
  },
} as any;

beforeEach(() => {
  jest.clearAllMocks();

  tx.booking.findUnique.mockReset();
  tx.booking.count.mockReset();
  tx.$queryRaw.mockReset();
  tx.$queryRaw.mockResolvedValue(undefined);

  jest.spyOn(AuditService.prototype, 'log').mockResolvedValue(undefined);
});

describe('FraudService', () => {
  test('should return null when user has no previous booking', async () => {
    tx.booking.findUnique.mockResolvedValue(null);

    const result = await fraudService.checkPurchaseLimit(tx, {
      userId: 1,
      eventId: 100,
      quantity: 2,
      idempotencyKey: '1',
    });
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.booking.findUnique).toHaveBeenCalledWith({
      where: {
        userId_eventId: {
          userId: 1,
          eventId: 100,
        },
      },
    });
    expect(result).toBeNull();
  });
  test('should allow purchase when total ticket quantity is below the limit', async () => {
    tx.booking.findUnique.mockResolvedValue({
      quantity: 1,
      userId: 1,
      eventId: 2,
    });
    const result = await fraudService.checkPurchaseLimit(tx, {
      userId: 1,
      eventId: 2,
      quantity: 2,
      idempotencyKey: '1',
    });

    expect(tx.$queryRaw).toHaveBeenCalled();

    expect(tx.booking.findUnique).toHaveBeenCalledWith({
      where: {
        userId_eventId: {
          userId: 1,
          eventId: 2,
        },
      },
    });
    expect(result).toEqual({
      userId: 1,
      eventId: 2,
      quantity: 1,
    });
  });
  test('should allow purchase when total ticket quantity equals the limit', async () => {
    tx.booking.findUnique.mockResolvedValue({
      quantity: 1,
      userId: 1,
      eventId: 2,
    });
    const result = await fraudService.checkPurchaseLimit(tx, {
      userId: 1,
      eventId: 2,
      quantity: 3,
      idempotencyKey: '1',
    });

    expect(tx.$queryRaw).toHaveBeenCalled();

    expect(tx.booking.findUnique).toHaveBeenCalledWith({
      where: {
        userId_eventId: {
          userId: 1,
          eventId: 2,
        },
      },
    });
    expect(result).toEqual({
      userId: 1,
      eventId: 2,
      quantity: 1,
    });
  });
  test('should throw an error when total ticket quantity exceeds the limit', async () => {
    tx.booking.findUnique.mockResolvedValue({
      quantity: 1,
      userId: 1,
      eventId: 2,
    });

    await expect(
      fraudService.checkPurchaseLimit(tx, {
        quantity: 5,
        userId: 1,
        eventId: 2,
        idempotencyKey: '1',
      }),
    ).rejects.toThrow('Purchase limit exceeded');
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: AuditAction.FRAUD_DETECTED,
        userId: 1,
        entityType: 'EVENT',
        entityId: 2,
      }),
    );
  });
  test('should allow booking when booking attempts are below the velocity limit', async () => {
    tx.booking.count.mockResolvedValue(2);
    await expect(fraudService.checkVelocity(tx, 1)).resolves.toBeUndefined();
    expect(tx.booking.count).toHaveBeenCalled();

    expect(AuditService.prototype.log).not.toHaveBeenCalled();
  });
  test('should throw an error when booking attempts reach the velocity limit', async () => {
    tx.booking.count.mockResolvedValue(5);
    await expect(fraudService.checkVelocity(tx, 1)).rejects.toThrow(
      'Too many booking attempts',
    );
    expect(AuditService.prototype.log).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: AuditAction.FRAUD_DETECTED,
        userId: 1,
      }),
    );
  });
});
