import express from 'express';
import handler from 'express-async-handler';

import * as controllers from './dataControllers';

const router = express.Router();

router.get('/extracted_data', handler(async (req, res) => {
  const data = await controllers.getExtractedData();
  res.send(data);
}));

router.get('/transformed_data', handler(async (req, res) => {
  const data = await controllers.getTransformedData();
  res.send(data);
}));

export default router;
