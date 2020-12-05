import neo from 'neo4j-driver';

import config from './appConfig';

const driver = neo.driver(`${config.host}:${config.port}`);
const neo4j = driver.session();

export default neo4j;
