import { Document, ObjectId } from 'mongoose';

interface IIdentifiers {
  name: string;
  about: string;
}

interface IProfileCard extends IIdentifiers {
  schedule: ObjectId;
  coverImgPath: string;
  active: boolean;
}

interface IFacility extends IProfileCard, Document {
  tags: Set<string>;
  imagesPaths: string[];
  location: string;
}

interface IPassword {
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  adminPassword?: string;
}

interface IUser extends Document, IProfileCard, IPassword {
  email: string;
  groups: ObjectId[];
  calendars: ObjectId[];
  tasks: ObjectId[];
  events: ObjectId[];
  systemRole: string;
}

interface IUserMethods {
  correctPassword(candPass: string, userPass: string): boolean;
  changedPasswordAfter(tokenTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

export { IIdentifiers, IFacility, IUser, IProfileCard, IUserMethods };
