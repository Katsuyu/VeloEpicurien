import { Place } from '@googlemaps/google-maps-services-js';
import { MongoClient } from 'mongodb';
import logger from './appLogger';
import { GPlacesClient } from './extractGPlacesData';

async function seedRestaurants(mongo: MongoClient): Promise<void> {
  const collection = mongo.db('veloepicurien').collection('restaurants');

  logger.info('Preparing MongoDB indexes...');
  await collection.createIndex({
    location: '2dsphere',
  });

  const oldDocumentsCount = await collection.countDocuments();
  logger.info(`There are currently ${oldDocumentsCount} restaurants stored in the database.`);

  logger.info('Creating Google Places client...');
  const gPlacesClient = new GPlacesClient(process.env.GPLACES_API_KEY as string, false);

  logger.info('Retrieving data...');

  const processBatch = async (restaurants: Partial<Place>[]) => {
    for (const restaurant of restaurants) {
      // eslint-disable-next-line no-await-in-loop
      await collection.updateOne({
        placeId: restaurant.place_id,
      }, {
        $set: {
          place_id: restaurant.place_id,
          location: {
            type: 'Point',
            coordinates: [restaurant.geometry?.location.lng, restaurant.geometry?.location.lat],
          },
          name: restaurant.name,
          types: restaurant.types,
          rating: restaurant.rating,
          totalRating: restaurant.user_ratings_total,
        },
      }, {
        upsert: true,
      });
    }
  };

  await gPlacesClient.getAllRestaurantsBetween({
    minLat: 48.883731,
    maxLat: 48.897501,
    minLng: 2.328813,
    maxLng: 2.370398,
  }, processBatch);

  const documentsCount = await collection.countDocuments();
  logger.info(`There are now ${documentsCount} restaurants stored in the database (+${documentsCount - oldDocumentsCount}).`);
}

async function main(): Promise<void> {
  logger.info('Connecting to MongoDB...');
  const mongo = new MongoClient(process.env.MONGO_URL as string);
  await mongo.connect();

  await seedRestaurants(mongo);

  await mongo.close();
}

main();
