import express from 'express';
import { MongoClient } from 'mongodb';

const mongo = new MongoClient(process.env.MONGO_URL as string);

async function connectMongo() {
  if (!mongo.isConnected()) {
    await mongo.connect();
  }
}

const router = express.Router();

router.get('/ping', (req, res) => res.send('pong'));
router.get('/heartbeat', (req, res) => res.send({ villeChoisie: 'Paris' }));

router.get('/extracted_data', async (req, res) => {
  await connectMongo();

  res.send({
    nbRestaurants: await mongo.db('veloepicurien').collection('restaurants').countDocuments(),
    nbSegments: 0,
  });
});

router.get('/transformed_data', async (req, res) => {
  await connectMongo();

  const restaurantsStats = await mongo.db('veloepicurien').collection('restaurants').aggregate([
    { $unwind: { path: '$types' } },
    { $group: { _id: '$types', count: { $sum: 1 } } },
  ]).toArray();

  res.send({
    restaurants: restaurantsStats.map((stat) => ({
      [stat._id]: stat.count,
    })),
    longueurCyclable: 0.0,
  });
});

export default router;
