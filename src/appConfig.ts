import { get } from 'env-var';

const env = (name: string, required = true) => get(name).required(required);

export enum MODES {
  TEST = 'test',
  LOCAL = 'local',
  DEV = 'dev',
  PROD = 'prod',
}

export const config = {
  port: env('PORT').asPortNumber(),
  mode: env('MODE').asEnum(Object.values(MODES)),
  dbUrl: env('DB_URL').asString(),
  saltRounds: 12,
};
