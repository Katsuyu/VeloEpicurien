import mongo from '../appMongo';
import logger from '../appLogger';

export default async function waitApp() {
  logger.info('Waiting mongoDB...');
  if (!mongo.isConnected()) {
    await mongo.connect();
  }
  logger.info('MongoDB successfully connected !');
}
