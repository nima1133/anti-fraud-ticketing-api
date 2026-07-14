import { NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { AuditService } from './auditService';
import { Request, Response } from 'express';
import { AuditEntity } from '../generated/prisma/enums';

const auditService = new AuditService();

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const data = await auditService.getAll(req.query);
  res.status(200).json({
    status: 'success',
    data,
  });
});
export const getByUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await auditService.getByUser(Number(req.params.id));
  res.status(200).json({
    status: 'success',
    data,
  });
});
export const getByEntity = asyncHandler(async (req: Request, res: Response) => {
  const data = await auditService.getByEntity( req.params.entityType as AuditEntity, Number(req.params.id));
  res.status(200).json({
    status: 'success',
    data,
  });
});
