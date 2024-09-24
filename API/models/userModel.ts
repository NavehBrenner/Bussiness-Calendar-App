import { Document, model, Model, Schema } from 'mongoose';
import { IPresonalCalendar, PersonalCalendar } from './calendarModel';
import { IUser } from '../interfaces/IProfiles';

const userSchema: Schema<IUser> = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Users must have a username'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Users must have an email'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Users must have a password'],
    trim: true,
  },

  profilePhoto: {
    type: String,
    required: false,
  },
});

const User: Model<IUser> = model('User', userSchema);

export { IUser, User };
