

import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

import userRouter from './user/userRoutes';
import authRouter from './auth/authRoutes';
import eventRouter from './event/eventRoute';
import reserveRouter from './booking/bookingRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      message: 'Too many requests. Please try again later.',
    },
  })
);

app.use(hpp());

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/event', eventRouter);
app.use('/api/v1/book', reserveRouter);

app.use(errorHandler);

export default app;