import express from 'express';
import handler from 'express-async-handler';

import validate from '../../middlewares/validationMiddleware';

import * as controllers from './restaurantControllers';
import { } from './restaurantTypes';

const router = express.Router();

router.get('/', handler(async (req, res) => {
  const restaurants = await controllers.listRestaurants();
  res.send(restaurants);
}));

export default router;
