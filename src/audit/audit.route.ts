import { Router } from 'express';
import { getAll, getByEntity, getByUser } from './auditController';
import { protect } from '../auth/authController';
import { restrictTo } from '../middlewares/restrictTo';

const router = Router();

/**
 * @swagger
 * /api/v1/audit:
 *   get:
 *     summary: Get all audit logs
 *     description: Returns a paginated list of audit logs. Supports filtering, sorting and pagination. Admin only.
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of audit logs per page.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "-createdAt"
 *         description: Sort by field. Prefix with '-' for descending order.
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum:
 *             - USER_REGISTERED
 *             - USER_LOGGED_IN
 *             - USER_CHANGE_PASSWORD
 *             - BOOKING_CREATED
 *             - BOOKING_CONFIRMED
 *             - BOOKING_CANCELLED
 *             - BOOKING_EXPIRED
 *             - FRAUD_DETECTED
 *         description: Filter by audit action.
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Filter by user ID.
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum:
 *             - BOOKING
 *             - EVENT
 *         description: Filter by entity type.
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: integer
 *           example: 15
 *         description: Filter by entity ID.
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully.
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
 *                         example: 1
 *                       action:
 *                         type: string
 *                         example: BOOKING_CREATED
 *                       userId:
 *                         type: integer
 *                         example: 5
 *                       entityType:
 *                         type: string
 *                         example: BOOKING
 *                       entityId:
 *                         type: integer
 *                         example: 12
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-07-16T15:40:15.000Z"
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/', protect, restrictTo('ADMIN'), getAll);

/**
 * @swagger
 * /api/v1/audit/user/{id}:
 *   get:
 *     summary: Get audit logs by user
 *     description: Returns every audit log created by a specific user.
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID.
 *         example: 5
 *     responses:
 *       200:
 *         description: User audit logs retrieved successfully.
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
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get('/user/:id', protect, restrictTo('ADMIN'), getByUser);

/**
 * @swagger
 * /api/v1/audit/entity/{entityType}/{id}:
 *   get:
 *     summary: Get audit logs by entity
 *     description: Returns audit logs for a specific entity type and entity ID.
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - BOOKING
 *             - EVENT
 *         description: Entity type.
 *         example: BOOKING
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Entity ID.
 *         example: 10
 *     responses:
 *       200:
 *         description: Entity audit logs retrieved successfully.
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
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get(
  '/entity/:entityType/:id',
  protect,
  restrictTo('ADMIN'),
  getByEntity,
);

export default router;
