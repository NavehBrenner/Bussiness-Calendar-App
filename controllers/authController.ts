import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { IUser, User } from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import sendEmail from '../utils/email';
import crypto from 'crypto';

// sing a JWT with secret and set an expiration date
const signToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendLoginToken = (res: Response, user: IUser, statusCode: number) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      // set cookie to expire after time specified time in .env file (in minuets)
      Date.now() + +process.env.JWT_COOKIE_EXPIRES! * 60 * 1000
    ),
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions); // send jwt login token vai secure cookie
  // @ts-ignore // set password to undefined to not leak user password once sent in response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  });
};

const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // create new user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      // only allow premissioned users to create new admins
      role:
        process.env.ADMIN_PASSWORD === req.body.adminPassword
          ? req.body.role
          : 'user',
    });

    sendLoginToken(res, newUser, 201);
  }
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError('Please provide email and password', 400));

    // find user in DB
    const user = await User.findOne({
      email,
    }).select('+password');
    // USER DOES NOT EXIST OR INVALID PASSWORD
    if (!user || !user.correctPassword(req.body.password, user.password))
      return next(new AppError('Incorrect email or password', 401));

    sendLoginToken(res, user, 200);
  }
);

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    // check for auth header and correct auth method (bearer token) if exist extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
      return next(
        new AppError('You are not logged in! Please log in to get access', 401)
      );

    // decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Check if user related to teken exists
    const currentUser = await User.findById((decoded as any).id);
    if (!currentUser) return next(new AppError('User no longer exists'));

    // Check if user changed password after jwt was issued
    if (
      currentUser.changedPasswordAfter((decoded as JwtPayload).iat as number)
    ) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE and set current user on request for future user related routes
    req.user = currentUser;
    next();
  }
);

// restrict route for SYSTEM admins, has nothing to do with roles and premissions within groups and calendars
const systemRestriction = catchAsync(
  (req: Request, res: Response, next: NextFunction) => {
    // Check if user is an admin
    if (req.user?.systemRole !== 'admin') {
      return next(
        new AppError('You do not have permission to preform this action', 403)
      );
    }
    next();
  }
);

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user based on email
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return next(
        new AppError('There is no user with that email address', 404)
      );

    // generate reset token and ser it on current user
    const resetToken = user.createPasswordResetToken();
    // save reset token to DB no need for validation in this point, nothing had changed
    await user.save({ validateBeforeSave: false });

    // create reset url
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // create mail message
    const message = `Forgot your password? Submit a new path request with your new password to ${resetURL}. If you did not forget your password please ignore this email`;

    // send mail to user
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minuets)',
        message,
      });
    } catch (err) {
      // if an error accoured during the email sending stop reset password proccess
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Please try again later!',
          500
        )
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Your password reset token is sent to your email',
    });
  }
);

// this function is used for forgot password reset proccess
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // use same hashing to hash UN-hashed token user has recivied in order to compare with HASED token in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // find user based to reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // if token has not expired, and there is user, set new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // login user
    sendLoginToken(res, user, 200);
  }
);

// this function is used for logged in user changing password proccess
const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user from collection
    const user = await User.findById(req.user?._id).select('+password');

    if (!user)
      return next(new AppError('This user does no longer exists', 404));

    const authenticated = user.correctPassword(
      req.body.passwordCurrent || '',
      user.password
    );

    // check if POSTed password is correct
    if (!authenticated)
      return next(new AppError('Your current password is not correct.', 401));

    // if password is correct update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;

    await user.save();

    // login user
    sendLoginToken(res, user, 200);
  }
);

export {
  signUp,
  login,
  protect,
  systemRestriction,
  forgotPassword,
  resetPassword,
  updatePassword,
};
