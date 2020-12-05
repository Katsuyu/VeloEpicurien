import { MongoClient } from 'mongodb';

import config from './appConfig';

const mongo = (new MongoClient(config.mongoUrl, {
  useUnifiedTopology: true,
})).db('veloepicurien');

export default mongo;
