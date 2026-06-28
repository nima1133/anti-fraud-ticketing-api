import Router from 'express';
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  updateEvent,
} from './eventController';
import { protect } from '../auth/authController';
const router = Router();

router.route('/').get(getAllEvents).post(protect, createEvent);
router.route('/:id').patch(updateEvent).delete(deleteEvent).get(getEvent);

export default router;
