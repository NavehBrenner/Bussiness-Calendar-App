import { Model, ObjectId } from 'mongoose';

interface IIdentifiers {
  name: string;
  about: string;
}

interface IProfileCard extends IIdentifiers {
  schedule: ObjectId;
  coverImgPath: string;
  active: boolean;
}

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profilePhoto: String;
  calendars: []; // calendar id's
}

export { IUser };
