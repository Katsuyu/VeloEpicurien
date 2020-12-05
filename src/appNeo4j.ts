import neo from 'neo4j-driver';

import config from './appConfig';

const driver = neo.driver(`${config.neo4jHost}:${config.neo4jPort}`);
const neo4j = driver.session();

export default neo4j;
