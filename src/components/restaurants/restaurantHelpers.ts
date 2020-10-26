import { Restaurant } from '@prisma/client';

import { RestaurantRo } from './restaurantTypes';

/**
 * Build a user Response Object (RO) with only the fields to be shown to the user
 * Can be used to compute or add extra informations to the user object, useful for front-end display
 *
 * @param user The restaurant object to format
 * @returns A user Response Object ready to be sent into API responses
 */
export function buildRestaurantRo(restaurant: Restaurant): RestaurantRo {
  return {
    id: restaurant.id,
    registeredAt: restaurant.registeredAt,
    name: restaurant.name,
  };
}
