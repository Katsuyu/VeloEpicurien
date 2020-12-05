import express from 'express';
import handler from 'express-async-handler';

import validate from '../../middlewares/validationMiddleware';
import * as controllers from './itineraryControllers';
import { GenerateItineraryDto } from './itineraryTypes';

const router = express.Router();

router.get('/parcours', validate(GenerateItineraryDto), handler(async (req, res) => {
  const itinerary = await controllers.generateItinerary(req.body);
  res.send(itinerary);
}));

export default router;
