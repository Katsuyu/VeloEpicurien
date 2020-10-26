import express from 'express';

import restaurants from './restaurants/restaurantRoutes';

const router = express.Router();

router.get('/ping', (req, res) => res.send('pong'));
router.get('/heartbeat', (req, res) => res.send({ villeChoisie: 'Paris' }));

router.use('/restaurants', restaurants);

export default router;
