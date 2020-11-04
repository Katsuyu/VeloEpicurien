import express from 'express';
import { MongoClient } from 'mongodb';
import neo4j, { Session } from 'neo4j-driver';
import { get } from 'env-var';

const env = (name: string, required = true) => get(name).required(required);

const config = {
  host: env('NEO4J_HOST').asUrlString(),
  port: env('NEO4J_PORT').asPortNumber(),
  user: env('NEO4J_USER').asString(),
  password: env('NEO4J_PASSWORD').asString(),
};

/*  MongoDB */
const mongo = new MongoClient(process.env.MONGO_URL as string, {
  useUnifiedTopology: true,
});

/*  Neo4J */
let driver;

async function connectMongo() {
  if (!mongo.isConnected()) {
    await mongo.connect();
  }
}

function connectNeo(): Session {
  driver = neo4j.driver(`${config.host}:${config.port}`);
  return driver.session();
}

const router = express.Router();

router.get('/ping', (req, res) => res.send('pong'));
router.get('/heartbeat', (req, res) => res.send({ villeChoisie: 'Paris XVIIIème' }));

router.get('/extracted_data', async (req, res) => {
  await connectMongo();
  const neo = connectNeo();

  res.send({
    nbRestaurants: await mongo.db('veloepicurien').collection('restaurants').countDocuments(),
    nbSegments: (await neo.run('MATCH ()-[segment:Route]-() RETURN segment')).records.length,
  });
});

router.get('/transformed_data', async (req, res) => {
  await connectMongo();
  const neo = connectNeo();

  const restaurantsStats = await mongo.db('veloepicurien').collection('restaurants').aggregate([
    { $unwind: { path: '$types' } },
    { $group: { _id: '$types', count: { $sum: 1 } } },
  ]).toArray();

  res.send({
    restaurants: restaurantsStats.reduce((current, stat) => {
      current[stat._id] = stat.count;
      return current;
    }, {}),
    // Since every nodes are connected in a bidirectional way, we divide the number
    // of Routes by 2. Real distance will be used later, since openStreetMap API doesn't
    // provide this information (even if they documented that they would)
    longueurCyclable: (await neo.run('MATCH ()-[segment:Route]-() RETURN segment')).records.length / 2,
  });
});

export default router;
