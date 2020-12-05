import mongo from '../appMongo';

export default async function waitApp() {
  await mongo.connect();
}
