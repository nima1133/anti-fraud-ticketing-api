import Router from 'express';
import {
  changePassword,
  login,
  logout,
  protect,
  refreshToken,
  register,
} from './authController';
import { authLimiter } from '../middlewares/authLimiter';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - passwordConfirm
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: User registered successfully.
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
 *                       example: 1
 *                     user:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
 *       400:
 *         description: Validation failed or passwords do not match.
 *       409:
 *         description: An account with this email already exists.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post('/register', authLimiter(60 * 60 * 1000, 15), register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticates a user and returns a JWT access token. A refresh token is stored as an HttpOnly cookie.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials.
 *       403:
 *         description: Account is inactive.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post('/login', authLimiter(15 * 60 * 1000, 5), login);

/**
 * @swagger
 * /api/v1/auth/changePassword:
 *   post:
 *     summary: Change password
 *     description: Changes the authenticated user's password and revokes all active refresh tokens.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully.
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
 *                     message:
 *                       type: string
 *                       example: Password changed successfully
 *       400:
 *         description: Password validation failed.
 *       401:
 *         description: Unauthorized or current password is incorrect.
 *       404:
 *         description: User not found.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post(
  '/changePassword',
  protect,
  authLimiter(15 * 60 * 1000, 5),
  changePassword,
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Uses the refresh token stored in the HttpOnly cookie to issue a new access token and a new refresh token.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: HttpOnly refresh token.
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
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
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Refresh token is missing or invalid.
 *       401:
 *         description: Refresh token has been revoked.
 *       404:
 *         description: Refresh token has expired.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post('/refresh', authLimiter(15 * 60 * 1000, 30), refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Logs out the authenticated user by deleting the refresh token and clearing the authentication cookie.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: HttpOnly refresh token.
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.post('/logout', protect, logout);

export default router;
