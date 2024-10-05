import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { User } from '../models/userModel';
import {
  createOne,
  deleteById,
  getAll,
  getById,
  updateById,
} from '../utils/handlerFactory';

// filter object to only inclued fields specified in the ...fields param
const filterObj = (obj: Record<string, any>, ...fields: string[]) => {
  const filteredObj: Record<string, any> = {};
  fields.forEach((field) => {
    if (obj.hasOwnProperty(field)) {
      filteredObj[field] = obj[field];
    }
  });

  return filteredObj;
};

// set the req id to current user id to then allow getUserById return user his own data
const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user?.id;
  next();
};

const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // dont allow user to update passwords through this route
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new Error(
          'This route is not for password updates. Please use /updateMyPassword'
        )
      );
    }

    // filer the body to only inclued name and email (these are the only fields users should be allowd o change)
    const filteredBody = filterObj(req.body, 'name', 'email');

    // update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }
);

const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // set user as inactive, only an admin should be able to delete user from database
    await User.findByIdAndUpdate(req.user?.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

const createUser = createOne(User);
const getUserById = getById(User);
const updateUserById = updateById(User);
const deleteUserById = deleteById(User);
const getAllUsers = getAll(User);

export {
  createUser,
  deleteUserById,
  getUserById,
  updateUserById,
  getAllUsers,
  getMe,
  updateMe,
  deleteMe,
};
