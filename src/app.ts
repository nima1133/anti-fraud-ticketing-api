import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";


import paymentRouter from './payment/payment.route';
import userRouter from './user/user.routes';
import authRouter from './auth/auth.route';
import eventRouter from './event/event.route';
import reserveRouter from './booking/booking.route';
import auditRouter from './audit/audit.route';
import analyticRouter from './analytics/analytics.route';
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
  }),
);

app.use(hpp());

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());


app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/booking', reserveRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/analytics', analyticRouter);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(errorHandler);

export default app;
