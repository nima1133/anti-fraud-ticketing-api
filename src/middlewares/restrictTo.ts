import { NextFunction } from 'express';
import { AuthRequest } from '../auth/authController';
import asyncHandler from '../utils/asyncHandler';
import { AppError } from '../utils/appError';


export const restrictTo = (role: string) => {
  return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    if (role !== req.user.role) {
        throw new AppError('you dont have permission for this' , 403)
    }
    next()
  });
  
};
