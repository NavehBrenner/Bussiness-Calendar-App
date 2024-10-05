import express from 'express';
import {
  createUser,
  deleteMe,
  deleteUserById,
  getAllUsers,
  getMe,
  getUserById,
  updateMe,
  updateUserById,
} from '../controllers/userController';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signUp,
  systemRestriction,
  updatePassword,
} from '../controllers/authController';

const userRouter = express.Router();

userRouter.route('/signup').post(signUp);
userRouter.route('/login').post(login);
userRouter.route('forgotPassword').post(forgotPassword);
userRouter.route('/resetPassword').post(resetPassword);

userRouter.use(protect); // from now on these are protected routes - only for logged users

userRouter.route('/getMe').get(getMe, getUserById);
userRouter.route('/updateMe').post(updateMe);
userRouter.route('/deleteMe').delete(deleteMe);
userRouter.route('/updateMyPassword').post(updatePassword);

userRouter.use(systemRestriction); // from now on only system admins are allowd to access routs

userRouter.route('/').get(getAllUsers);
userRouter
  .route('/:id')
  .post(createUser)
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

export default userRouter;
