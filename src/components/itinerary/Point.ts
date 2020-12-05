export default class Point {
  public readonly id: string;

  public readonly distance: number;

  public readonly latitude: number;

  public readonly longitude: number;


  constructor(id: string, distance: number, latitude: number, longitude: number) {
    this.id = id;
    this.distance = distance;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static fromNeo4j(data: any) {
    return new Point(
      data.properties.id,
      data.properties.cost,
      data.properties.lat,
      data.properties.lng,
    );
  }
}
