import { Router } from 'express';
import { getAll, getByEntity, getByUser } from './auditController';
import { protect } from '../auth/authController';
import { restrictTo } from '../middlewares/restrictTo';

const router = Router();

router.get('/', protect , restrictTo("ADMIN"), getAll);
router.get('/user/:id', protect , restrictTo("ADMIN"), getByUser);
router.get('/entity/:entityType/:id', protect , restrictTo("ADMIN"), getByEntity);

export default router;