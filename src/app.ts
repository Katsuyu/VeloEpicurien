import express from 'express';

/*  This import is only used for class-transformer side effects */
import 'reflect-metadata';

import router from './components';
import requestLogger from './middlewares/requestLogger';
import errorMiddleware from './middlewares/errorMiddleware';
import notFoundMiddleware from './middlewares/notFoundMiddleware';

/*  Express server  */
const app = express();

/*  Middlewares */
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*  Proxy rules */
app.set('trust proxy', true);

/*  Routes  */
app.use(router);

/*  404 middleware  */
app.use(notFoundMiddleware);

/*  Error middleware  */
app.use(errorMiddleware);

export default app;
