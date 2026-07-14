import { prisma } from '../../lib/prisma';

export class AnalyticsService {
  async getOverview() {
    const [users, events, bookings, activeEvents, confirmedBookings] =
      await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.booking.count(),
        prisma.event.count({
          where: {
            date: {
              gte: new Date(),
            },
          },
        }),
        prisma.booking.count({
          where: {
            status: 'CONFIRMED',
          },
        }),
      ]);

    return {
      totalUsers: users,
      totalEvents: events,
      totalBookings: bookings,
      activeEvents,
      confirmedBookings,
    };
  }
  async getUserStats() {
    const [totalUsers, admins, users, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { role: 'ADMIN' },
      }),
      prisma.user.count({
        where: { role: 'USER' },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);
    return {
      totalUsers: totalUsers,
      admins: admins,
      users: users,
      newUsersThisMonth: newUsersThisMonth,
    };
  }
  async getEventStats() {
    const [
      totalEvents,
      upcomingEvents,
      expiredEvents,
      soldTickets,
      totalCapacity,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({
        where: {
          date: {
            gte: new Date(),
          },
        },
      }),
      prisma.event.count({
        where: {
          date: {
            lt: new Date(),
          },
        },
      }),
      prisma.event.aggregate({
        _sum: {
          sold: true,
        },
        where: { date: { gte: new Date() } },
      }),
      prisma.event.aggregate({
        _sum: {
          capacity: true,
        },
        where: { date: { gte: new Date() } },
      }),
    ]);
    return {
      totalEvents,
      upcomingEvents,
      expiredEvents,
      soldTickets: soldTickets._sum.sold ?? 0,
      totalCapacity: totalCapacity._sum.capacity ?? 0,
    };
  }

  async getBookingStats() {
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      expiredBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: 'CONFIRMED' },
      }),

      prisma.booking.count({
        where: { status: 'CANCELLED' },
      }),
      prisma.booking.count({
        where: { status: 'EXPIRED' },
      }),
    ]);
    return {
      totalBookings: totalBookings,
      confirmedBookings: confirmedBookings,
      cancelledBookings: cancelledBookings,
      expiredBookings: expiredBookings,
    };
  }
  private async cancellationRate() {
    const [cancelled, confirmed, expired] = await Promise.all([
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'EXPIRED' } }),
    ]);
    const total = cancelled + confirmed + expired;
    return total === 0 ? 0 : Number(((cancelled / total) * 100).toFixed(2));
  }
  async getCancellationStats() {
    const [cancelledBookings, cancellationRate] = await Promise.all([
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      this.cancellationRate(),
    ]);
    return {
      cancelledBookings,
      cancellationRate,
    };
  }

  async getExpiredHoldStats() {
    const [expiredReservations, activeHolds] = await Promise.all([
      prisma.booking.count({ where: { status: 'EXPIRED' } }),
      prisma.booking.count({ where: { status: 'HOLD' } }),
    ]);
    return {
      expiredReservations,
      activeHolds,
    };
  }
}
