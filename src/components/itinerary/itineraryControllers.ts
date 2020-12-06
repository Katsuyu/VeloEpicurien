import httpStatus from 'http-status-codes';
import createError from 'http-errors';

import neo4j from '../../appNeo4j';

import { GenerateItineraryDto, StartingPointDto } from './itineraryTypes';
import Point from './Point';
import Restaurant from './Restaurant';
import logger from '../../appLogger';
import Segment from './Segment';

async function findNearestRestaurant(from: string, types: string[], excludedRestaurants: string[]) {
  const typesFilter = types.length !== 0
    ? `any(genre in resto.types WHERE genre IN ${JSON.stringify(types)})`
    : '';

  const excludedRestaurantsFilter = excludedRestaurants.length !== 0
    ? `not resto.id in ${JSON.stringify(excludedRestaurants)}`
    : '';

  const filters = typesFilter.length === 0 && excludedRestaurantsFilter.length === 0
    ? ''
    : `WHERE ${typesFilter} ${typesFilter.length !== 0 && excludedRestaurantsFilter.length !== 0 ? 'and' : ''} ${excludedRestaurantsFilter}`;

  const query = `
  MATCH (start:Point {id: "${from}"})
  CALL gds.alpha.shortestPath.deltaStepping.write({
    nodeProjection: 'Point',
    relationshipProjection: {
      ROAD: {
        type: 'Route',
        properties: 'length'
      }
    },
    startNode: start,
    relationshipWeightProperty: 'length',
    delta: 3.0,
    writeProperty: 'cost'
  })
  YIELD nodeCount
  MATCH (p:Point) <-[:isLocatedAt]- (resto:Restaurant)
  ${filters}
  RETURN start, p, resto ORDER BY p.cost ASC LIMIT 1`;

  const result = await neo4j.run(query);
  const records = result.records[0];
  const point = Point.fromNeo4j(
    records.get('p'),
  );
  const restaurant = Restaurant.fromNeo4j(
    records.get('resto'),
  );

  return {
    from,
    point,
    restaurant,
  };
}

async function itineraryBetween(from: Point, to: Point) {
  const segment = new Segment();
  segment.add(to);

  let origin = to.id;

  while (origin !== from.id) {
    const query = `
    MATCH
    (origin:Point {id: "${origin}"}) <-[]- (p:Point)
    WHERE
    p.cost < origin.cost
    RETURN p ORDER BY p.cost ASC LIMIT 1
    `;
    // eslint-disable-next-line no-await-in-loop
    const result = await neo4j.run(query);
    const point = Point.fromNeo4j(
      result.records[0].get('p'),
    );

    segment.add(point);
    origin = point.id;
  }

  segment.reverse();
  return segment;
}

function adjustStopNumber(itinerary: Array<Restaurant | Segment>, numberOfStops: number) {
  let stopNumber = itinerary.reduce((acc, val) => acc + +(val instanceof Restaurant), 0);

  let toggle = false;
  let { length } = itinerary;
  for (let i = 0; stopNumber > numberOfStops; i += 1) {
    const index = i % length;
    const elem = itinerary[index];
    if (elem instanceof Restaurant) {
      if (toggle) {
        itinerary.splice(index, 1);
        length -= 1;
        stopNumber -= 1;
      }
      toggle = !toggle;
    }
  }
}

export async function generateItinerary(payload: GenerateItineraryDto) {
  const { startingPoint } = payload;

  const query = `
  MATCH (start:Point)
  WITH start, distance(point({
    latitude: start.lat, longitude: start.lng
  }), point({
    latitude: ${startingPoint.getLatitude()}, longitude: ${startingPoint.getLongitude()}
  })) as d
  WHERE d < 500
  RETURN d, start ORDER BY d ASC LIMIT 1
  `;

  const nearestPoints = await neo4j.run(query);

  if (nearestPoints.records.length === 0) {
    throw createError(httpStatus.EXPECTATION_FAILED, 'No point found in a 500m radius');
  }

  const itineraryStart = Point.fromNeo4j(
    nearestPoints.records[0].get('start'),
  );
  const initialDistance = nearestPoints.records[0].get('d');

  const itinerary: Array<Restaurant | Segment> = [];
  const visitedRestaurants = [];
  let totalDistance = initialDistance;
  let last: Point = itineraryStart;

  while (totalDistance < 0.9 * payload.maximumLength) {
    // eslint-disable-next-line no-await-in-loop
    const { point, restaurant } = await findNearestRestaurant(
      last.id, payload.type, visitedRestaurants,
    ) as {
      point: Point;
      restaurant: Restaurant;
    };

    if (point.id !== last.id) {
      // eslint-disable-next-line no-await-in-loop
      itinerary.push(await itineraryBetween(last, point));
      totalDistance += point.distance;
      last = point;
      logger.info(`Moving to point ${point.id} (${point.distance}m) - total distance: ${totalDistance}m`);
      // eslint-disable-next-line no-await-in-loop
    }

    visitedRestaurants.push(restaurant.id);
    itinerary.push(restaurant);
    logger.info(`Starting from point ${last.id}, found restaurant ${restaurant.id}`);
  }

  if (totalDistance > 1.1 * payload.maximumLength) {
    throw createError(httpStatus.EXPECTATION_FAILED, 'No itinerary found within +-10% of the asked length');
  }

  adjustStopNumber(itinerary, payload.numberOfStops);

  return {
    type: 'FeatureCollection',
    features: await Promise.all(itinerary.map(async (step) => step.toFeature())),
  };
}

export async function getStartingPoint(payload: StartingPointDto) {
  const minLat = 48.883731;
  const maxLat = 48.897501;
  const minLng = 2.328813;
  const maxLng = 2.370398;

  return {};
}
