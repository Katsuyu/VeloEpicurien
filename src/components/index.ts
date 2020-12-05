import express from 'express';

import data from './data/dataRoutes';
import itinerary from './itinerary/itineraryRoutes';

const router = express.Router();

router.get('/ping', (req, res) => res.send('pong'));
router.get('/heartbeat', (req, res) => res.send({
  villeChoisie: 'Paris XVIIIème',
}));

router.use(data);
router.use(itinerary);

export default router;
