import { get } from 'env-var';

const env = (name: string, required = true) => get(name).required(required);

export enum MODES {
  TEST = 'test',
  LOCAL = 'local',
  DEV = 'dev',
  PROD = 'prod',
}

const config = {
  mode: env('MODE').asEnum(Object.values(MODES)),
  neo4jHost: env('NEO4J_HOST').asUrlString(),
  neo4jPort: env('NEO4J_PORT').asPortNumber(),
  neo4jUser: env('NEO4J_USER').asString(),
  neo4jPassword: env('NEO4J_PASSWORD').asString(),
  mongoUrl: env('MONGO_URL').asString(),
};

export default config;
