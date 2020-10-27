import { Client as PgClient, QueryResult } from 'pg';
import logger from './appLogger';

async function pgLog(query: Promise<QueryResult<any>>): Promise<void> {
  logger.info(`[POSTGRESQL] ${(await query).command}`);
}

async function createPostgresTables(pgClient: PgClient): Promise<void> {
  await pgLog(pgClient.query(`
    DROP TABLE IF EXISTS restaurant
  `));

  await pgLog(pgClient.query(`
    CREATE TABLE restaurant (
      id SERIAL,
      name character varying NOT NULL
    )
  `));
}

async function main(): Promise<void> {
  logger.info('Connecting to Postgresql...');
  const pgClient = new PgClient({
    connectionString: process.env.DB_URL,
  });
  await pgClient.connect();

  logger.info('Creating Postgresql tables...');
  await createPostgresTables(pgClient);

  await pgClient.end();
}

main();
