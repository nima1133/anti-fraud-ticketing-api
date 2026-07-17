import { Router } from 'express';
import {
  deleteReservation,
  getAllTickets,
  getTicket,
  getTicketMe,
  reserveTicket,
} from './bookingController';
import { protect } from '../auth/authController';
import { restrictTo } from '../middlewares/restrictTo';

const router = Router();
/**
 * @swagger
 * /api/v1/booking/user/me:
 *   get:
 *     tags:
 *       - Booking
 *     summary: Get current user's bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       eventId:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */
router.get('/user/me', protect, getTicketMe);

/**
 * @swagger
 * /api/v1/booking/{eventId}:
 *   post:
 *     tags:
 *       - Booking
 *     summary: Reserve ticket(s)
 *     description: Reserve tickets for an event. The booking will be created with HOLD status and the user must complete payment before the timeout expires.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - idempotencyKey
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               idempotencyKey:
 *                 type: string
 *                 example: booking-123456
 *     responses:
 *       201:
 *         description: Ticket reserved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: please pay for your ticket !!!
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     eventId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: HOLD
 *                     idempotencyKey:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       400:
 *         description: Validation error or insufficient tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalid:
 *                       value: Invalid request body
 *                     soldout:
 *                       value: not enough ticket for your request
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: event not found
 *
 *       409:
 *         description: Purchase limit or fraud rule violation
 *
 *       429:
 *         description: Too many reservation attempts
 *
 *       500:
 *         description: Internal server error
 */
router.post('/:eventId', protect, reserveTicket);

/**
 * @swagger
 * /api/v1/booking/{eventId}:
 *   get:
 *     tags:
 *       - Booking
 *     summary: Get all reservations for an event
 *     description: Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         example: createdAt
 *     responses:
 *       200:
 *         description: List of reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       eventId:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden (Admin only)
 *
 *       404:
 *         description: Event not found
 *
 *       500:
 *         description: Internal server error
 */
router.get('/:eventId', protect, restrictTo('ADMIN'), getAllTickets);

/**
 * @swagger
 * /api/v1/booking/{bookingId}:
 *   delete:
 *     tags:
 *       - Booking
 *     summary: Cancel reserved ticket(s)
 *     description: Delete all or part of a reservation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deletedNumber
 *             properties:
 *               deletedNumber:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       204:
 *         description: Reservation deleted successfully
 *
 *       400:
 *         description: Invalid delete quantity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalid:
 *                       value: invalid quantity
 *                     exceed:
 *                       value: cannot delete more than reserved
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Reservation not found
 *
 *       500:
 *         description: Internal server error
 */
router.delete('/:bookingId', protect, deleteReservation);

/**
 * @swagger
 * /api/v1/booking/user/{bookingId}:
 *   get:
 *     tags:
 *       - Booking
 *     summary: Get a booking by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     eventId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     idempotencyKey:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                   example: booking not found
 *
 *       500:
 *         description: Internal server error
 */
router.get('/user/:bookingId', protect, getTicket);

export default router;
