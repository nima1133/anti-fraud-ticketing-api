import {Router} from 'express'
import { cancelPayment, completePayment } from './paymentController'

const router = Router()

/**
 * @swagger
 * /api/v1/payments/{id}/success:
 *   post:
 *     summary: Simulate successful payment
 *     description: |
 *       **Development endpoint.**
 *
 *       Simulates a successful payment by confirming a booking that is currently
 *       in `HOLD` status. This endpoint is intended only for testing and development.
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Payment completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   example: CONFIRMED
 *       404:
 *         description: Booking not found
 *       409:
 *         description: |
 *           Booking cannot be confirmed because:
 *           - It has already been confirmed.
 *           - It has already been cancelled.
 *           - It is no longer in HOLD status.
 *       500:
 *         description: Internal server error
 */
router.post('/:id/success', completePayment);

/**
 * @swagger
 * /api/v1/payments/{id}/fail:
 *   post:
 *     summary: Simulate failed payment
 *     description: |
 *       **Development endpoint.**
 *
 *       Simulates a failed payment by cancelling a booking that is currently
 *       in `HOLD` status and releasing the reserved tickets.
 *       This endpoint exists only for testing and development.
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Payment failed and booking cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   example: CANCELLED
 *       404:
 *         description: Booking not found
 *       409:
 *         description: |
 *           Booking cannot be cancelled because:
 *           - It has already been confirmed.
 *           - It has already been cancelled.
 *           - It is no longer in HOLD status.
 *       500:
 *         description: Internal server error
 */
router.post('/:id/fail', cancelPayment);

export default router