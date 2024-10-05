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
}

interface IUser extends Document, IProfileCard, IPassword {
  email: string;
  groups: ObjectId[];
  calendars: ObjectId[];
  tasks: ObjectId[];
  events: ObjectId[];
  systemRole: string;
}

export { IIdentifiers, IFacility, IUser, IProfileCard };
