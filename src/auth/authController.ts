import { Request, Response, NextFunction } from 'express';

import { AuthService } from './authService';
import asyncHandler from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import {
  changePasswordInput,
  loginInput,
  registerInput,
} from '../schemas/auth.schema';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

const cookieOptions = {
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development',
};
const auth = new AuthService();

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = registerInput.parse(req.body);
    const newUser = await auth.register(data);

    return res.status(201).json({
      status: 'success',
      data: newUser,
    });
  },
);
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = loginInput.parse(req.body);
    const token = await auth.login(data);

    res.cookie('refreshToken', token.refreshToken, cookieOptions);
    res.status(200).json({
      status: 'success',
      data: token.accessToken,
    });
  },
);

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    //     if (!req.user) {
    //   throw new AppError('Unauthorized', 401);
    // }

    if (!req.headers.authorization) {
      throw new AppError('please logged in again.', 400);
    }
    const user = await auth.protect(req.headers.authorization);
    req.user = { id: user.id, role: user.role };
    next();
  },
);
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const data = changePasswordInput.parse(req.body);
    const message = await auth.changePassword(req.user.id, data);
    res.status(200).json({
      status: 'success',
      data: message,
    });
  },
);

export const refreshToken = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.cookies.refreshToken) {
      throw new AppError('Please log in again', 401);
    }
    const newToken = await auth.refreshToken(req.cookies.refreshToken);
    res.cookie('refreshToken', newToken.refreshToken, cookieOptions);
    res.status(200).json({
      status: 'success',
      data: newToken.accessToken,
    });
  },
);
export const logout = asyncHandler(async (req: Request, res: Response) => {
  await auth.logout(req.cookies.refreshToken);

  res.clearCookie('refreshToken');

  res.status(200).json({
    message: 'Logged out',
  });
});
