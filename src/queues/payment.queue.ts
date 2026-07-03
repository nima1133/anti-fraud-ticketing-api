import { Queue } from 'bullmq';
import { connection } from '../../lib/redis';

export const paymentQueue = new Queue('payment-timeout', {
  connection,
});
