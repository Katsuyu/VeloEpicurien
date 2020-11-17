import type { MongoClient } from 'mongodb';
import neo4j from 'neo4j-driver';
import { get } from 'env-var';

const env = (name: string, required = true) => get(name).required(required);

const config = {
  host: env('NEO4J_HOST').asUrlString(),
  port: env('NEO4J_PORT').asPortNumber(),
  user: env('NEO4J_USER').asString(),
  password: env('NEO4J_PASSWORD').asString(),
};


export default async function placeRestaurantsInNeo4j(mongo: MongoClient) {
  // Connect to Neo4j
  const driver = neo4j.driver(`${config.host}:${config.port}`);
  const db = driver.session();

  // Iterer sur les restos
  const restaurants = await mongo
    .db('veloepicurien')
    .collection('restaurants')
    .find().toArray();


  let validRest = 0;
  for (const restaurant of restaurants) {
    const [lng, lat] = restaurant.location.coordinates;

    const query = `
    WITH point({latitude: ${lat}, longitude: ${lng}}) AS poi
    MATCH (cross:Point)
    WHERE distance(poi, point({latitude: cross.lat, longitude: cross.lng})) < 250
    RETURN distance(poi, point({latitude: cross.lat, longitude: cross.lng})) as d, cross
    ORDER BY d ASC LIMIT 1
    `;
      // eslint-disable-next-line no-await-in-loop
    const result = await db.run(query);
    if (result.records.length !== 0) {
      const [dist, node] = result.records[0].values();

      const linkQuery = `
      MATCH
        (cross:Point {id: "${(node as any).properties.id}"})
      CREATE
        (resto:Restaurant {id: "${restaurant._id}", types: ${JSON.stringify(restaurant.types)}}),
        (resto) -[:isLocatedAt {distance: ${dist}}]-> (cross)
      `;

      try {
        // eslint-disable-next-line no-await-in-loop
        await db.run(linkQuery);
        validRest += 1;
      } catch (err) {
        console.log(err);
      }
    }
  }

  console.log(`${validRest} valids on ${restaurants.length} restaurants`);

  // Close connections
  await db.close();
  await driver.close();
}
