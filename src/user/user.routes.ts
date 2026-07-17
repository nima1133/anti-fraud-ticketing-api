import { Router } from 'express';
// import { createUser } from "./userController"
import {
  deleteUser,
  getAllusers,
  getUser,
  getUserMe,
  updateUser,
  updateUserMe,
} from './userController';
import { protect } from '../auth/authController';
import { restrictTo } from '../middlewares/restrictTo';
const router = Router();

// router.post('/' , createUser)
router.use(protect);

router
  .route('/me')
  .get(getUserMe)
  .patch(updateUserMe);

router
  .route('/')
  .get(restrictTo('ADMIN'), getAllusers);

router
  .route('/:id')
  .get(restrictTo('ADMIN'), getUser)
  .patch(restrictTo('ADMIN'), updateUser)
  .delete(restrictTo('ADMIN'), deleteUser);
export default router;

// GET    /users
// GET    /users/:id
// GET    /users/me
// PATCH  /users/:id
// DELETE /users/:id   (soft delete recommended)
// PATCH  /users/me
