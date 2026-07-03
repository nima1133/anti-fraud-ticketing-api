import {Router} from 'express'
import { cancelPayment, completePayment } from './paymentController'

const router = Router()

router.post('/:id/success', completePayment);
router.post('/:id/fail', cancelPayment);

export default router