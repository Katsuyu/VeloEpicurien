import express, { ErrorRequestHandler } from 'express';
import morgan from 'morgan';
import createError from 'http-errors';
import httpStatus from 'http-status-codes';

/*  This import is only used for class-transformer side effects */
import 'reflect-metadata';

import { config } from './appConfig';
import logger from './appLogger';
import router from './components';

/*  Express server  */
const app = express();
const { port } = config;

/*  Middlewares */
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*  Proxy rules */
app.set('trust proxy', true);

/*  Routes  */
app.use(router);

/*  404 middleware  */
app.use((req, res, next) => {
  next(createError(httpStatus.NOT_FOUND, `${req.url} not found`));
});

/*  Error middleware  */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(((err, req, res, _) => {
  logger.error(err.message);
  if (!err.status) {
    // If the error is not an HTTP error, the whole object is printed through console.error
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
}) as ErrorRequestHandler);

/*  Server error handlers */
process.on('uncaughtException', (e) => logger.error(e));
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
process.on('unhandledRejection', (e: any) => logger.error(e ? e.stack : e));

app.listen(port, () => logger.info(`Server listening on port ${port}...`));
