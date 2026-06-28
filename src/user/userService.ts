// GET    /users
// GET    /users/:id
// GET    /users/me
// PATCH  /users/:id
// DELETE /users/:id   (soft delete recommended)
// PATCH  /users/me
import { prisma } from '../../lib/prisma';
import { ApiFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/appError';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};
export class UserService {
async getAllUsers(query: any) {
  const options = new ApiFeatures(query)
    .filter()
    .sort()
    .paginate()
    .build();

  return await prisma.user.findMany({
    ...options,
    where: {
      active: true,
      ...options.where,
    },
    select: userSelect,
  });
}
  async getUser(userId: number) {
    const user = await prisma.user.findFirst({
      where: { id: userId, active: true },
      select: userSelect,
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
  async updateUser(userId: number, data: { name: string }) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        active: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect,
    });
  }

  async deleteUser(userId: number) {
    await prisma.user.update({
      where: { id: userId },
      data: { active: false },
    });
  }
}
