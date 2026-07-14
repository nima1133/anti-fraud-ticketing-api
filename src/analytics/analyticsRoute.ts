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

router.get('/overview', getOverview);
router.get('/users', getUserStats);
router.get('/events', getEventStats);
router.get('/bookings', getBookingStats);
router.get('/cancellations', getCancellationStats);
router.get('/holds', getExpiredHoldStats);

export default router;
