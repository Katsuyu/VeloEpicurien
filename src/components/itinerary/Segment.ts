import Point from './Point';

export default class Segment {
  public readonly points: Point[];

  constructor(points: Point[] = []) {
    this.points = points;
  }

  add(point: Point) {
    this.points.push(point);
  }

  pop() {
    return this.points.pop();
  }

  reverse() {
    this.points.reverse();
  }

  getDistance() {
    return this.points.reduce((acc, val) => acc + val.distance, 0);
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
        length: this.getDistance(),
      },
    };
  }
}
