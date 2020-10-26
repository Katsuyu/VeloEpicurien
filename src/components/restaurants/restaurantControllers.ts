import httpStatus from 'http-status-codes';
import createError from 'http-errors';

import db from '../../appDatabase';

import { buildRestaurantRo } from './restaurantHelpers';

export function listRestaurants() {
  return db.restaurant.findMany();
}
