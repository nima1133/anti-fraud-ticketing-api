import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
    stack: err.stack,
    error: err,
  });
};
const sendErrorProd = (err: any, res: Response) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: err.issues,
    });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          status: 'fail',
          message: 'A record with this value already exists.',
        });

      case 'P2003':
        return res.status(400).json({
          status: 'fail',
          message: 'Foreign key constraint failed.',
        });

      case 'P2025':
        return res.status(404).json({
          status: 'fail',
          message: 'Record not found.',
        });

      default:
        return res.status(400).json({
          status: 'fail',
          message: err.message,
        });
    }
  }
  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token.',
    });
  }

  if (err instanceof TokenExpiredError) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token has expired.',
    });
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid database query.',
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed.',
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === 'development') return sendErrorDev(err, res);
  sendErrorProd(err, res);
};

// ZodError
// JsonWebTokenError
// TokenExpiredError
// PostgreSQL errors
// Unknown errors
