import { Router } from 'express';
import {
  getBookingStats,
  getCancellationStats,
  getEventStats,
  getExpiredHoldStats,
  getOverview,
  getUserStats,
} from './analyticsController';
import { protect } from '../auth/authController';
import { restrictTo } from '../middlewares/restrictTo';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

/**
 * @swagger
 * /api/v1/analytics/overview:
 *   get:
 *     summary: Get dashboard overview
 *     description: Returns overall statistics for users, events, bookings, active events, and confirmed bookings.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   example: 120
 *                 totalEvents:
 *                   type: integer
 *                   example: 15
 *                 totalBookings:
 *                   type: integer
 *                   example: 340
 *                 activeEvents:
 *                   type: integer
 *                   example: 8
 *                 confirmedBookings:
 *                   type: integer
 *                   example: 275
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/overview', getOverview);

/**
 * @swagger
 * /api/v1/analytics/users:
 *   get:
 *     summary: Get user statistics
 *     description: Returns statistics about registered users, administrators, regular users, and new users created during the last 30 days.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   example: 150
 *                 admins:
 *                   type: integer
 *                   example: 5
 *                 users:
 *                   type: integer
 *                   example: 145
 *                 newUsersThisMonth:
 *                   type: integer
 *                   example: 18
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/users', getUserStats);

/**
 * @swagger
 * /api/v1/analytics/events:
 *   get:
 *     summary: Get event statistics
 *     description: Returns statistics about all events, upcoming events, expired events, sold tickets, and total ticket capacity.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEvents:
 *                   type: integer
 *                   example: 20
 *                 upcomingEvents:
 *                   type: integer
 *                   example: 12
 *                 expiredEvents:
 *                   type: integer
 *                   example: 8
 *                 soldTickets:
 *                   type: integer
 *                   example: 530
 *                 totalCapacity:
 *                   type: integer
 *                   example: 1200
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/events', getEventStats);

/**
 * @swagger
 * /api/v1/analytics/bookings:
 *   get:
 *     summary: Get booking statistics
 *     description: Returns the total number of bookings grouped by booking status.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBookings:
 *                   type: integer
 *                   example: 500
 *                 confirmedBookings:
 *                   type: integer
 *                   example: 420
 *                 cancelledBookings:
 *                   type: integer
 *                   example: 50
 *                 expiredBookings:
 *                   type: integer
 *                   example: 30
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/bookings', getBookingStats);

/**
 * @swagger
 * /api/v1/analytics/cancellations:
 *   get:
 *     summary: Get cancellation statistics
 *     description: Returns the total number of cancelled bookings and the cancellation rate as a percentage.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cancellation statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cancelledBookings:
 *                   type: integer
 *                   example: 35
 *                 cancellationRate:
 *                   type: number
 *                   format: float
 *                   example: 8.24
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/cancellations', getCancellationStats);

/**
 * @swagger
 * /api/v1/analytics/expired-holds:
 *   get:
 *     summary: Get expired reservation statistics
 *     description: Returns the number of expired reservations and currently active reservations on hold.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired reservation statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expiredReservations:
 *                   type: integer
 *                   example: 28
 *                 activeHolds:
 *                   type: integer
 *                   example: 6
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/expired-holds', getExpiredHoldStats);

export default router;
