import Point from './Point';

export default class Segment {
  public readonly points: Point[];

  constructor(points: Point[] = []) {
    this.points = points;
  }

  add(point: Point) {
    this.points.push(point);
  }

  reverse() {
    this.points.reverse();
  }

  toFeature() {
    if (this.points.length < 2) {
      return null;
    }
    return {
      type: 'Feature',
      geometry: {
        type: 'MultiLineString',
        coordinates: [this.points.map(
          (point) => [point.longitude, point.latitude],
        )],
      },
      properties: {
        length: this.points.reduce(
          (acc, val) => acc + val.distance, 0,
        ),
      },
    };
  }
}
