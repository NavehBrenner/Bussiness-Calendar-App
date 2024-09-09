import express from 'express';
import { createUser, deleteUser } from '../controllers/userController';

const userRouter = express.Router();

userRouter.route('/').post(createUser).delete(deleteUser);
export default userRouter;
