import express, { Request, Response, NextFunction } from 'express';
import AppError from './utils/appError';
import morgan from 'morgan';
import { config } from 'dotenv';
import userRouter from './routes/userRoute';
import globalErrorHandler from './controllers/errorController';
import helmet, { xssFilter } from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

config();

const app = express();

// ==============GLOBAL MIDDLEWARE=============
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// SECURITY AND DATA SANITIZATION
app.use(helmet()); // set security https request headers

// limit requests coming from same IP
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, Please try again in 15 minuets',
  })
);

app.use(mongoSanitize()); // data sanitization for NoSQL query injections
app.use(xssFilter()); // data sanitization against XSS (HTML injections)
app.use(hpp()); // prevent parameter polution in queries

// ==============GLOBAL MIDDLEWARE END================
// ROUTERS
app.use('/api/v1/users', userRouter);

// define a default route for all request for routs that do not exist in server
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// propegate any errors server encouters
app.use(globalErrorHandler);

export default app;
