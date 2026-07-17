import bcrypt from 'bcrypt';
import { prisma } from './../../lib/prisma';
import { AppError } from '../utils/appError';
import createToken from '../utils/tokenMaker';
import crypto from "node:crypto";
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import {
  changePasswordDto,
  LoginDto,
  RegisterDto,
} from '../schemas/auth.schema';
import { AuditService } from '../audit/auditService';
import { AuditAction } from '../generated/prisma/enums';

const hashRefreshToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
const auditService = new AuditService();

export class AuthService {
  async register(data: RegisterDto) {
    if (data.password !== data.passwordConfirm) {
      throw new AppError('Passwords do not match.', 400);
    }
    if (
      await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      })
    ) {
      throw new AppError('An account already exists with this email.', 409);
    }
    const hashPassword = await bcrypt.hash(
      data.password,
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashPassword,
      },
    });
    await auditService.log(prisma, {
      action: AuditAction.USER_REGISTERED,
      userId: user.id,
    });
    return {
      id: user.id,
      user: user.name,
      email: user.email,
    };
  }
  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }
    if (!user.active) {
      throw new AppError('Account has been deactivated', 403);
    }
    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }
    const token = createToken(user.id);
    await prisma.refreshToken.create({
      data: {
        refreshToken: hashRefreshToken(token.refreshToken),
        userId: user.id,
        expiresAt: new Date(
          Date.now() +
            Number(process.env.REFRESH_TOKEN_DB_DAYS) * 24 * 60 * 60 * 1000,
        ),
      },
    });
    auditService.log(prisma, {
      action: AuditAction.USER_LOGGED_IN,
      userId: user.id,
    });
    return token;
  }
  async protect(authHeader: string) {
    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
    };
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });
    if (!user) {
      throw new AppError('user is not exist', 400);
    }
    return user;
  }
  async changePassword(userId: number, data: changePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const correct = await bcrypt.compare(data.currentPassword, user.password);

    if (!correct) {
      throw new AppError('Current password is incorrect', 401);
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    const hashed = await bcrypt.hash(
      data.newPassword,
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          password: hashed,
        },
      });

      await tx.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    });
    auditService.log(prisma , {
      action : AuditAction.USER_CHANGE_PASSWORD , 
      userId : userId
    })
    return {
      message: 'Password changed successfully',
    };
  }
  async refreshToken(refreshToken: string) {
    const token = await prisma.refreshToken.findUnique({
      where: { refreshToken: hashRefreshToken(refreshToken) },
    });
    if (!token) {
      throw new AppError('pls login again', 400);
    }
    if (token.expiresAt < new Date()) {
      throw new AppError('pls login again', 404);
    }
    if (token.revokedAt) {
      throw new AppError('Please login again', 401);
    }
    const newToken = createToken(token.userId);
    const hashedRefreshToken = hashRefreshToken(newToken.refreshToken);
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: token.id },
        data: {
          revokedAt: new Date(),
        },
      });

      await tx.refreshToken.create({
        data: {
          refreshToken: hashedRefreshToken,
          userId: token.userId,
          expiresAt: new Date(
            Date.now() +
              Number(process.env.REFRESH_TOKEN_DB_DAYS) * 24 * 60 * 60 * 1000,
          ),
        },
      });
    });
    return newToken;
  }
  async logout(refreshToken: string) {
    if (!refreshToken) return;

    await prisma.refreshToken.deleteMany({
      where: {
        refreshToken: hashRefreshToken(refreshToken),
      },
    });
  }
}
