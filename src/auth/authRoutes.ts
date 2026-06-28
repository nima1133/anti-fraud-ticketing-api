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

router.post('/login',authLimiter( 15*60*1000 , 5), login);
router.post('/register',authLimiter( 60*60*1000 , 15), register);
router.post('/changePassword', protect, authLimiter(15 * 60 * 1000, 5), changePassword);
router.post('/refresh',authLimiter( 15*60*1000 , 30), refreshToken);
router.post('/logout' , protect , logout)
export default router;

// POST   /auth/register
// POST   /auth/login
// POST   /auth/logout
// GET    /auth/me
// POST   /auth/refresh-token   (optional but recommended)
