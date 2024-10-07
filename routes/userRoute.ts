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
userRouter.route('/forgotPassword').post(forgotPassword);
userRouter.route('/resetPassword/:token').patch(resetPassword);

userRouter.use(protect); // from now on these are protected routes - only for logged users

userRouter.route('/getMe').get(getMe, getUserById);
userRouter.route('/updateMe').patch(updateMe);
userRouter.route('/deleteMe').delete(deleteMe);
userRouter.route('/updateMyPassword').patch(updatePassword);

userRouter.use(systemRestriction); // from now on only system admins are allowd to access routs

userRouter.route('/').get(getAllUsers);

userRouter
  .route('/:id')
  .get(getUserById)
  .post(createUser)
  .patch(updateUserById)
  .delete(deleteUserById);

export default userRouter;
