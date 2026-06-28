import { Request, Response, NextFunction } from 'express';
import { EventService } from './eventService';
import asyncHandler from '../utils/asyncHandler';
import { AuthRequest } from '../auth/authController';
import { AppError } from '../utils/appError';
import { updateEventInput , createEventInput } from '../schemas/event.schema';

const eventService = new EventService();

export const getAllEvents = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const events = await eventService.getAllEvents(req.query);
    res.status(200).json({
      status: 'success',
      data: events,
    });
  },
);
export const getEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await eventService.getEvent(Number(req.params.id));
    res.status(200).json({
      status: 'success',
      data: user,
    });
  },
);
export const createEvent = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const data = createEventInput.parse(req.body);
    const newUser = await eventService.createEvent(req.user.id, data);
    res.status(201).json({
      status: 'success',
      data: newUser,
    });
  },
);
export const updateEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = updateEventInput.parse(req.body);
    
    const updatedUser = await eventService.updateEvent(
      Number(req.params.id),
      data,
    );
    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  },
);
export const deleteEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await eventService.deleteEvent(Number(req.params.id));
    res.status(204).send();
  },
);
