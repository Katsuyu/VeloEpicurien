import express from 'express';
import path from 'path';

import data from './data/dataRoutes';
import itinerary from './itinerary/itineraryRoutes';

const router = express.Router();

router.get('/ping', (req, res) => res.send('pong'));

router.get('/heartbeat', (req, res) => res.send({
  villeChoisie: 'Paris XVIIIème',
}));

router.get('/readme', (req, res) => res.sendFile(
  'README.md',
  {
    root: path.join(__dirname, '..', '..'),
  },
));

router.use(data);
router.use(itinerary);

export default router;
