const axios = require('axios')

const separate = (minLo, minLa, maxLo, maxLa) => {
  const pageLo = Number(((maxLo - minLo) / 3).toFixed(6))
  const pageLa = Number(((maxLa - minLa) / 3).toFixed(6))
  let squareMinLo = minLo
  let squareMinLa = minLa
  const squaredZone = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      squaredZone.push([Number(squareMinLo), Number(squareMinLa), Number(squareMinLo + pageLo), Number(squareMinLa + pageLa)])
      squareMinLo += pageLo
    }
    squareMinLo = minLo
    squareMinLa += pageLa
  }
  return squaredZone
}

const getData = async (squareArray) => {
  let element = [];
  for (let square of squareArray) {
    console.log(square)
    try {
      const { data } = await axios.get(`https://api.openstreetmap.org/api/0.6/map?bbox=${square[0]},${square[1]},${square[2]},${square[3]}`);
      element = element.concat(data.elements)
    } catch (e) {
      console.log("error occured")
    }
  }
  nodeList = element.filter((e) => e.type === "node");
  wayList = element.filter((e) => e.type === "way");
  relationList = element.filter((e) => e.type === "relation");

  console.log(`node = ${nodeList.length}`);
  console.log(nodeList[0]);
  console.log(`way = ${wayList.length}`);
  console.log(wayList[0]);
  console.log(`relation = ${relationList.length}`);
  console.log(relationList[0]);
  console.log(nodeList.length + wayList.length + relationList.length === element.length ? "On est bons !" : "Y'a une couille dans le paté")
}

// Paris 18eme : 2.328813,48.883731,2.370398,48.897501
getData(separate(2.328813,48.883731,2.370398,48.897501)).then(() => {
  process.exit(0)
});