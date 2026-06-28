import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { UserService } from './userService';
import { AuthRequest } from '../auth/authController';
import { AppError } from '../utils/appError';
import { userSchema } from '../schemas/user.schema';
// export const createUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { name, password, email, role } = req.body;
//   const user = await prisma.user.create({
//     data: {
//       name,
//       password,
//       email,
//       role
//     },
//   });
//   return res.status(201).json({
//     status: 'success',
//     data: user,
//   });
// };


const userService = new UserService();

//ADMIN
export const getAllusers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAllUsers(req.query);
    res.status(200).json({
      status: 'success',
      data: users,
    });
  },
);

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.getUser(Number(req.params.id));
    res.status(200).json({
      status: 'success',
      data: user,
    });
  },
);
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.deleteUser(Number(req.params.id));
    res.status(204).send();
  },
);
export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = userSchema.parse(req.body);
    const updateUser = await userService.updateUser(
      Number(req.params.id),
      data,
    );
    res.status(200).json({
      status: 'success',
      data: updateUser,
    });
  },
);

//user
export const getUserMe = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('UnAuthorized', 401);
    }
    const user = await userService.getUser(req.user.id);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  },
);
export const updateUserMe = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('UnAuthorized', 401);
    }
    const data = userSchema.parse(req.body);
    const updateUser = await userService.updateUser(req.user.id, data);
    res.status(200).json({
      status: 'success',
      data: updateUser,
    });
  },
);
