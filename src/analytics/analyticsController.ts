import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analyticsService';
import asyncHandler from '../utils/asyncHandler';

const analyticsService = new AnalyticsService();

export const getOverview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await analyticsService.getOverview();

    res.status(200).json({
      success: 'success',
      data,
    });
  },
);
export const getUserStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await analyticsService.getUserStats();

    res.status(200).json({
      success: 'success',
      data,
    });
  },
);

export const getEventStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await analyticsService.getEventStats();

    res.status(200).json({
      success: 'success',
      data,
    });
  },
);

export const getBookingStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await analyticsService.getBookingStats();

    res.status(200).json({
      success: 'success',
      data,
    });
  },
);

export const getCancellationStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await analyticsService.getCancellationStats();

    res.status(200).json({
      success: 'success',
      data,
    });
  },
);

export const getExpiredHoldStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await analyticsService.getExpiredHoldStats();

    res.status(200).json({
      success: 'success',
      data,
    });
  },
);
