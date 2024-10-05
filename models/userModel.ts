import { Document, model, Model, Schema } from 'mongoose';
import { IUser } from '../interfaces/IProfiles';
import validator from 'validator';

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Users must have a username'],
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
      validate: validator.isStrongPassword,
    },
    passwordConfirm: String,
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
    systemRole: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    active: Boolean,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User: Model<IUser> = model('User', userSchema);

export { IUser, User };
