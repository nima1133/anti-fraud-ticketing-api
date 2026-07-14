import { PrismaClient } from '@prisma/client/extension';
import { Prisma, AuditAction, AuditEntity } from '../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiFeatures } from '../utils/apiFeatures';

interface AuditLogData {
  action: AuditAction;
  userId: number;
  entityType?: AuditEntity;
  entityId?: number;
}

export class AuditService {
  async log(db: Prisma.TransactionClient | PrismaClient, data: AuditLogData) {
    try {
      await db.auditLog.create({ data });
    } catch (error) {
      console.error('Audit log failed:', error);
      // don't throw
    }
  }
  async getAll(query: any) {
    const options = new ApiFeatures(query).filter().sort().paginate().build();
    return await prisma.auditLog.findMany(
      options as Prisma.AuditLogFindManyArgs,
    );
  }

  async getByUser(userId: number) {
    return await prisma.auditLog.findMany({
      where: {  userId },
    });
  }

  async getByEntity(entityType: AuditEntity, entityId: number) {
    return await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
    });
  }
}
