import express from 'express';

const router = express.Router();

router.get('/ping', (req, res) => res.send('pong'));
router.get('/heartbeat', (req, res) => res.send({ villeChoisie: 'Paris' }));

export default router;
