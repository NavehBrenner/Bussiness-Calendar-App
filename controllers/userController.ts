import { Request, Response } from 'express';
import { IUser, User } from '../models/userModel';

const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      status: 'Success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      error: err,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndDelete({
      email: req.body.email,
    });

    if (!user) throw new Error('User not found', { cause: null });

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  } catch (err: any) {
    if (!err.cause) {
      return res.status(404).json({
        status: 'fail',
        error: err,
      });
    }
    res.status(400).json({
      status: 'fail',
      error: err,
    });
  }
};

export { createUser, deleteUser };
