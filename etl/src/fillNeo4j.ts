import neo4j from 'neo4j-driver';
import { get } from 'env-var';

import extractOsmData from './extractOsmData';

const env = (name: string, required = true) => get(name).required(required);

const config = {
  host: env('NEO4J_HOST').asUrlString(),
  port: env('NEO4J_PORT').asPortNumber(),
  user: env('NEO4J_USER').asString(),
  password: env('NEO4J_PASSWORD').asString(),
};

const driver = neo4j.driver(`${config.host}:${config.port}`);
const db = driver.session();

type Node = any;

async function createNode(nodes: { [key: string]: Node }, nodeId: string) {
  const node = nodes[nodeId];
  if (!node) {
    return false;
  }

  const query = `MERGE (:Point {id: "${node.id}", lat: toFloat("${node.lat}"), lng: toFloat("${node.lon}")})`;

  try {
    const result = await db.run(query);
    console.log(`Success node ${nodeId}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function createLink(
  nodes: { [key: string]: Node },
  way: any, node1Id: string, node2Id: string,
) {
  if (!nodes[node1Id] || !nodes[node2Id]) {
    return false;
  }
  const query = `
  MATCH
    (point1:Point {id: "${node1Id}"}),
    (point2:Point {id: "${node2Id}"})
  MERGE
    (point1) -[:Route {name: "${way?.tags?.name ?? 'Unknown'}", length: distance(point({latitude: point1.lat, longitude: point1.lng}), point({latitude: point2.lat, longitude: point2.lng}))}]-> (point2)
  MERGE
    (point2) -[:Route {name: "${way?.tags?.name ?? 'Unknown'}", length: distance(point({latitude: point1.lat, longitude: point1.lng}), point({latitude: point2.lat, longitude: point2.lng}))}]-> (point1)
  `;

  try {
    const result = await db.run(query);
    return true;
  } catch (error) {
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

/*
test();
*/
