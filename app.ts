import express, { Request, Response, NextFunction } from 'express';
import AppError from './utils/appError';
import morgan from 'morgan';
import { config } from 'dotenv';
import userRouter from './routes/userRoute';
import globalErrorHandler from './controllers/errorController';

config();

const app = express();

// 1) MIDDLEWARE
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// 2) ROUTERS
app.use('/api/v1/users', userRouter);

// define a default route for all request for routs that do not exist in server
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// propegate any errors server encouters
app.use(globalErrorHandler);

export default app;
