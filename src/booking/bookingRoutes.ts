import { Router } from 'express';
import {
  deleteReservation,
  getAllTickets,
  getTicket,
  getTicketMe,
  reserveTicket,
} from './bookingController';
import { protect } from '../auth/authController';

const router = Router();

router.get('/user/me', protect, getTicketMe);
router.route('/:eventId').post(protect, reserveTicket).get( getAllTickets);
router.delete('/:bookingId', deleteReservation);
router.get('/user/:bookingId', getTicket);

export default router;
