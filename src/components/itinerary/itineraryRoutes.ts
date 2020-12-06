import express from 'express';
import handler from 'express-async-handler';

import validate from '../../middlewares/validationMiddleware';
import * as controllers from './itineraryControllers';
import {GenerateItineraryDto, StartingPointDto} from './itineraryTypes';

const router = express.Router();

router.get('/parcours', validate(GenerateItineraryDto), handler(async (req, res) => {
  const itinerary = await controllers.generateItinerary(req.body);
  res.send(itinerary);
}));

router.get('/starting_point', validate(StartingPointDto), handler(async (req, res) => {
  const startingPoint = await controllers.getStartingPoint(req.body);
  res.send(startingPoint);
}));

export default router;
