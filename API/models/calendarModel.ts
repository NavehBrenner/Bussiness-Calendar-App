import { Document, model, Model, Schema } from 'mongoose';

interface ICalendar extends Document {}

interface IPresonalCalendar extends ICalendar {}

interface ISharedCalendar extends ICalendar {}

const personalCalendarSchema: Schema<IPresonalCalendar> = new Schema({});
const sharedCalendarSchema: Schema<ISharedCalendar> = new Schema({});

const PersonalCalendar: Model<IPresonalCalendar> = model(
  'PersonalCaledar',
  personalCalendarSchema
);
const SharedCalendar: Model<ISharedCalendar> = model(
  'SharedCaledar',
  sharedCalendarSchema
);

export {
  ICalendar,
  IPresonalCalendar,
  ISharedCalendar,
  PersonalCalendar,
  SharedCalendar,
};
