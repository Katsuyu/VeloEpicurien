import { ObjectId } from 'mongodb';

import mongo from '../../appMongo';

export default class Restaurant {
  public readonly id: string;

  public readonly types: string[];

  constructor(id: string, types: string[]) {
    this.id = id;
    this.types = [...types];
  }

  static fromNeo4j(data: any) {
    return new Restaurant(
      data.properties.id,
      data.properties.types,
    );
  }

  async toFeature() {
    const restaurant = await mongo
      .db('veloepicurien')
      .collection('restaurants')
      .findOne({ _id: new ObjectId(this.id) });

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: restaurant.location.coordinates,
      },
      properties: {
        name: restaurant.name,
        Type: restaurant.types,
        rating: restaurant.rating,
        totalRating: restaurant.totalRating,
      },
    };
  }
}
