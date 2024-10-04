import { Document, ObjectId } from 'mongoose';
import { IIdentifiers } from './IProfiles';

type role = string;
type mail = string;

interface IMembers {
  fcilities: ObjectId[];
  users: mail;
  roles: Record<mail, role>;
}

interface IMessage {
  sender: mail;
  time: Date;
  content: string;
}

interface IDiscussion extends IMembers, IIdentifiers {
  messages: IMessage[];
}

interface IGroup extends IMembers, IIdentifiers, Document {
  calendars: ObjectId[];
  discussions: IDiscussion[];
}

interface ICalendar extends IMembers, IIdentifiers, Document {
  events: ObjectId[];
  tasks: ObjectId[];
}

export { IMembers, IDiscussion, IGroup, mail, ICalendar };
