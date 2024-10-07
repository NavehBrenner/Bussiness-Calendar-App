import { Document, model, Model, Schema } from 'mongoose';
import { IUser, IUserMethods } from '../interfaces/IProfiles';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Users must have a username'],
      minlength: 3,
      trim: true,
    },
    about: {
      type: String,
      maxlength: 150,
    },
    email: {
      type: String,
      required: [true, 'Users must have an email'],
      unique: true,
      trim: true,
      validate: validator.isEmail,
    },
    password: {
      type: String,
      required: [true, 'Users must have a password'],
      trim: true,
      validate: {
        validator: (value: string) =>
          validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 0,
            minSymbols: 0,
          }),
        message:
          'Password must be at least 8 characters long, and have at least 1 lowercase letter and 1 number',
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Users must confirm their password'],
      trim: true,
      validate: {
        validator: function (this: IUser, passwordConfrim: string) {
          return this.password === passwordConfrim;
        },
        message: 'Passwords do not match',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    coverImgPath: {
      type: String,
      required: false,
    },
    schedule: {
      type: Schema.ObjectId,
      ref: 'Calendar',
    },
    groups: [
      {
        type: Schema.ObjectId,
        ref: 'Group',
      },
    ],
    calendars: [
      {
        type: Schema.ObjectId,
        ref: 'Calendar',
      },
    ],
    tasks: [
      {
        type: Schema.ObjectId,
        ref: 'Task',
      },
    ],
    events: [
      {
        type: Schema.ObjectId,
        ref: 'Event',
      },
    ],
    adminPassword: String,
    systemRole: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      validate: {
        validator: function (this: IUser, systemRole: string) {
          return (
            systemRole !== 'admin' ||
            this.adminPassword === process.env.ADMIN_PASSWORD
          );
        },
        message: 'Premission denied to create admin user',
      },
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    methods: {
      correctPassword(candPass, userPass) {
        return bcrypt.compareSync(candPass, userPass);
      },
      createPasswordResetToken() {
        // create reset token to send to user
        const resetToken = crypto.randomBytes(32).toString('hex');

        // encryt reset token that is saved to database
        this.passwordResetToken = crypto
          .createHash('sha256')
          .update(resetToken)
          .digest('hex');

        // set token expiration date to RESET_TOKEN_EXPIRES minuets from now
        this.passwordResetExpires = new Date(
          Date.now() + +process.env.RESET_TOKEN_EXPIRES! * 60 * 1000
        );
        return resetToken;
      },
      changedPasswordAfter(tokenTimestamp: number) {
        return this.passwordResetExpires?.getTime()! < tokenTimestamp;
      },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// add index to mails to allow quick lookup for users using their mail, allowing groups and calendars members list be a list of mails rather than user document id's
userSchema.index({ email: 1 }, { unique: true });

// filter from query all inactive users
userSchema.pre(/^find/, function (this: Model<IUser>, next) {
  this.find({ active: { $ne: false } });
  next();
});

// encrypt password before save to database
userSchema.pre('save', async function (next) {
  // only run fuction if password was modified - prevernts from rehasing password at time that password is not changed, e.g. user updates email - will call save method but password was not modified
  if (!this.isModified('password')) return next();

  // encrypt password with cost 14
  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined;
  this.adminPassword = undefined;
  next();
});

// update passwordChangedAt property one password change events
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // update timestamp, subtract 1000 (1 sec) to ensure that the password change happend BEFORE the JWT wat created, there is a slight delay when the document is saved to the BD, this delay might cause the JWT.tia (time issued at) to be before the password change, thus making it invalid and requiring user to login again after password reset
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

const User = model<IUser, UserModel>('User', userSchema);

export { User };
