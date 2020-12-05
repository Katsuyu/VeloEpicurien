import app from './app';
import config from './appConfig';
import logger from './appLogger';
import waitApp from './utils/waitApp';

const port = 8080;

(async function main() {
  await waitApp();
  app.listen(port, () => logger.info(`Server listening on port ${port} on mode ${config.mode}...`));
}());
