import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { config } from 'dotenv';
import userRouter from './routes/userRoute';

config();

const app = express();

// 1) MIDDLEWARE
app.use(express.json());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// 2) ROUTERS
app.use('/api/v1/users', userRouter);

export default app;
