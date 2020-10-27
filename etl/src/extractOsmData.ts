import axios from 'axios';

function separate(minLo: number, minLa: number, maxLo: number, maxLa: number) {
  const pageLo = Number(((maxLo - minLo) / 3).toFixed(6));
  const pageLa = Number(((maxLa - minLa) / 3).toFixed(6));
  let squareMinLo = minLo;
  let squareMinLa = minLa;
  const squaredZone: Array<Array<number>> = [];

  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      squaredZone.push([
        squareMinLo,
        squareMinLa,
        squareMinLo + pageLo,
        squareMinLa + pageLa,
      ]);
      squareMinLo += pageLo;
    }
    squareMinLo = minLo;
    squareMinLa += pageLa;
  }
  return squaredZone;
}

async function getData(squareArray: Array<Array<number>>) {
  const element: Array<any> = [];
  for (const square of squareArray) {
    console.log(square);
    try {
      // eslint-disable-next-line no-await-in-loop
      const { data } = await axios.get(`https://api.openstreetmap.org/api/0.6/map?bbox=${square[0]},${square[1]},${square[2]},${square[3]}`);
      element.push(...data.elements);
    } catch (e) {
      console.log('Error occured');
    }
  }

  const nodeList = element.filter((e) => e.type === 'node');
  const wayList = element.filter((e) => e.type === 'way');
  const relationList = element.filter((e) => e.type === 'relation');

  console.log(`node = ${nodeList.length}`);
  console.log(`way = ${wayList.length}`);
  console.log(`relation = ${relationList.length}`);
  console.log(nodeList.length + wayList.length + relationList.length === element.length ? 'On est bons !' : 'Y\'a une couille dans le paté');
}

// Paris 18eme : 2.328813,48.883731,2.370398,48.897501
getData(separate(2.328813, 48.883731, 2.370398, 48.897501)).then(() => {
  process.exit(0);
});
