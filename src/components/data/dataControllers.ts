import mongo from '../../appMongo';
import neo4j from '../../appNeo4j';

export async function getExtractedData() {
  const nbRestaurants = await mongo
    .db('veloepicurien')
    .collection('restaurants')
    .countDocuments();

  const segments = await neo4j.run(
    'MATCH ()-[segment:Route]-() RETURN segment',
  );
  const nbSegments = segments.records.length;

  return { nbRestaurants, nbSegments };
}

export async function getTransformedData() {
  const restaurantsStats = await mongo
    .db('veloepicurien')
    .collection('restaurants')
    .aggregate([
      { $unwind: { path: '$types' } },
      { $group: { _id: '$types', count: { $sum: 1 } } },
    ]).toArray();

  const restaurants = restaurantsStats.reduce((current, stat) => {
    current[stat._id] = stat.count;
    return current;
  }, {});

  const longueurCyclable = (await neo4j
    .run('MATCH ()-[segment:Route]-() RETURN segment')
  ).records.reduce((acc, val) => acc + val.get('segment').properties.length, 0);

  return { restaurants, longueurCyclable };
}
