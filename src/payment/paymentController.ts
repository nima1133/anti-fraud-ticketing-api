import { Request, Response } from 'express';
import { PaymentService } from './paymentService';
import asyncHandler from '../utils/asyncHandler';

const paymentService = new PaymentService();

export const completePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await paymentService.completePayment(
      Number(req.params.id),
      true,
    );
    res.status(200).json({
      status: 'success',
      data: payment,
    });
  },
);
export const cancelPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await paymentService.completePayment(
      Number(req.params.id),
      false,
    );
    res.status(200).json({
      status: 'fail',
      data: payment,
    });
  },
);
