
import rateLimit from 'express-rate-limit';

export const authLimiter = (windowMs : number , max : number ) => {
   return rateLimit({
  windowMs,
  max,
  message: {
    message: 'Too many attempts.',
  },
})
};