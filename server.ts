import mongoose, { ConnectOptions } from 'mongoose';
import app from './app';

const DB = process.env.MONGO_CLUSTER!.replace(
  '<CLUSTER_PASSWORD>',
  process.env.CLUSTER_PASSWORD!
);

const clientOptions: ConnectOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

mongoose
  .connect(DB, clientOptions)
  .then(() => console.log('Connection Successful'));

// START SERVER
const APP_PORT = process.env.DEV_PORT || 8080;
app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});
