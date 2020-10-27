import neo4j from 'neo4j-driver';
import { get } from 'env-var';

import { stream } from 'winston';
import extractOsmData from './extractOsmData';

const env = (name: string, required = true) => get(name).required(required);

const config = {
  host: env('NEO4J_HOST').asUrlString(),
  port: env('NEO4J_PORT').asPortNumber(),
  user: env('NEO4J_USER').asString(),
  password: env('NEO4J_PASSWORD').asString(),
};

const driver = neo4j.driver(`${config.host}:${config.port}`, neo4j.auth.basic(config.user, config.password));
const db = driver.session();

type Node = any;

async function createNode(nodes: { [key: string]: Node }, nodeId: string) {
  const node = nodes[nodeId];
  if (!node) {
    console.log('Turbo pas yay');
    return false;
  }

  const query = `MERGE (:Point {id: "${node.id}", lat: "${node.lat}", lng: "${node.lon}"})`;

  try {
    console.log('Creating node');
    const result = await db.run(query);
    console.log(`Success node ${nodeId}`);
    return true;
  } catch (error) {
    console.log('Point - failure :(');
    console.error(error);
    return false;
  }
}

async function createLink(
  nodes: { [key: string]: Node },
  way: any, node1Id: string, node2Id: string,
) {
  if (!nodes[node1Id] || !nodes[node2Id]) {
    console.log('Turbo pas yay, link version :(');
    return false;
  }
  const query = `
  MATCH
    (point1:Point {id: "${node1Id}"}),
    (point2:Point {id: "${node2Id}"})
  CREATE
    (point1) -[:Route {name: "${way?.tags?.name ?? 'Unknown'}"}]-> (point2),
    (point2) -[:Route {name: "${way?.tags?.name ?? 'Unknown'}"}]-> (point1)
  `;

  try {
    console.log('Creating rel');
    const result = await db.run(query);
    console.log('Success rel');
    return true;
  } catch (error) {
    console.log('Link - failure :(');
    console.error(error);
    return false;
  }
}

export default async function fillNeo4j() {
  const data = await extractOsmData();

  const nodes: {[key: string]: Node} = {};
  data.nodes.forEach((node) => {
    nodes[node.id] = node;
  });

  const ways = data.ways.filter(({ tags }) => tags && (
    'cycleway' in tags
      || tags.highway === 'cycleway'
      || tags.busway === 'lane'
  ));

  for (const way of ways) {
    let start;
    for (const node of way.nodes) {
      // eslint-disable-next-line no-await-in-loop
      let res = await createNode(nodes, node);

      if (start && res) {
        // eslint-disable-next-line no-await-in-loop
        res = await createLink(nodes, way, start, node);
      }

      // If the node is not created, reset segment
      if (!res) {
        start = undefined;
      } else {
        start = node;
      }
    }
  }
  console.log(`Non filtered nodes length : ${data.nodes.length}`);
  console.log(`With duplicates removed : ${Object.values(nodes).length}`);


  let nodesReferenced = 0;
  let existingNodesReferences = 0;
  const t: {[key: string]: boolean} = {};
  for (const way of ways) {
    for (const node of way.nodes) {
      t[node] = true;
      nodesReferenced += 1;
      if (nodes[node]) {
        existingNodesReferences += 1;
      }
    }
  }

  console.log(`Number of nodes referenced by ways : ${nodesReferenced}`);
  console.log(`Number of nodes referenced by ways and on which we have data : ${existingNodesReferences}`); // Should equal 1849
  console.log(`Number of different valid nodes referenced by ways : ${Object.values(t).length}`); // Number of neo4j node created should match
}

async function test() {
  console.log('Start');
  await fillNeo4j();
  console.log('Finished :)');
}

test();
