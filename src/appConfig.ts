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
  host: env('NEO4J_HOST').asUrlString(),
  port: env('NEO4J_PORT').asPortNumber(),
  user: env('NEO4J_USER').asString(),
  password: env('NEO4J_PASSWORD').asString(),
  mongoUrl: env('MONGO_URL').asString(),
};

export default config;