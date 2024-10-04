import { Document } from 'mongoose';
import { IDiscussion, IMembers, mail } from './IGroups';
import { IIdentifiers } from './IProfiles';

interface IActivityDate {
  start: Date;
  end: Date;
}

type filter = (options: object) => boolean;

interface IActivitySettings extends IIdentifiers, IMembers {
  discussions: IDiscussion[];
  filter: filter[];
  date: IActivityDate;
}

interface ITask extends IActivitySettings, Document {
  assignments: string[];
}

interface IEvent extends IActivitySettings, Document {
  attendenceConfirmation: Record<mail, boolean>;
}

export { IEvent, ITask };
