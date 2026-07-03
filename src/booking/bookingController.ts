import { AuthRequest } from '../auth/authController';
import { AppError } from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { BookingService } from './bookingService';
import { Request, Response, NextFunction } from 'express';
import { reserveTicketInput, paramsInput } from '../schemas/booking.schema';

const booking = new BookingService();

export const reserveTicket = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const data = reserveTicketInput.parse(req.body);
    const params = paramsInput.parse(req.params);
    const newReserve = await booking.reserveTicket({
      userId: req.user.id,
      eventId: params.eventId,
      quantity: data.quantity,
      idempotencyKey : data.idempotencyKey
    });
    res.status(201).json({
      status: 'success',
      message : 'please pay for yout ticket !!!',
      data: newReserve,
    });
  },
);

export const deleteReservation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await booking.deleteReservation(
      Number(req.params.bookingId),
      Number(req.body.deletedNumber),
    );
    res.status(204).send();
  },
);
export const getTicketMe = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const tickets = await booking.getTicketMe(req.user.id);
    res.status(200).json({
      status: 'success',
      data: tickets,
    });
  },
);

//ADMIN
export const getAllTickets = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tickets = await booking.getAllTickets(
      Number(req.params.eventId),
      req.query,
    );
    res.status(200).json({
      status: 'success',
      data: tickets,
    });
  },
);

export const getTicket = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await booking.getTicket(Number(req.params.bookingId));
    if (!ticket) {
      throw new AppError('booking not found', 404);
    }
    res.status(200).json({
      status: 'success',
      data: ticket,
    });
  },
);
