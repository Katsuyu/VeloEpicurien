import axios, { AxiosInstance } from 'axios';
import { Place, PlaceType1 } from '@googlemaps/google-maps-services-js';


class GPlacesClient {
  private readonly client: AxiosInstance;

  private readonly key: string;

  constructor(apiKey: string, debug = true) {
    this.key = apiKey;
    this.client = axios.create({
      baseURL: 'https://maps.googleapis.com/',
      validateStatus: (status) => true,
    });

    if (debug) {
      this.client.interceptors.request.use((request) => {
        console.log(`${request.method} - ${request.baseURL}${request.url}`);
        if (request.params) console.log(`Query params : ${JSON.stringify(request.params, null, 2)}`);
        if (request.data) console.log(`Body : ${JSON.stringify(request.data, null, 2)}`);
        return request;
      });

      this.client.interceptors.response.use((response) => {
        console.log(`Status : ${response.status} - ${response.statusText}`);
        if (response.status > 300) {
          console.error(response.data);
        }
        return response;
      });
    }
  }

  /**
   * Haversine formula, use to measure the distance in meters between two points on the earth
   *
   * @param lat1 Latitude of the first point
   * @param lng1 Longitude of the first point
   * @param lat2 Latitude of the second point
   * @param lng2 Longitude of the second point
   * @return Distance (in meters)
   */
  distanceBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6378.137; // Radius of earth in KM
    const dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    const dLng = (lng2 * Math.PI) / 180 - (lng1 * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180)
      * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 1000; // meters
  }

  /**
   * Get all restaurants in the given rectangle
   * Proceed by fetching all restaurants into a circle with a radius of 100m,
   * and by gradually moving the circle 100m away
   * Will warn you if a single request exceed 60 restaurants (max allowed by google)
   */
  async getAllRestaurantsBetween(params: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) {
    const latInc = 0.001834999999999809 / 2; // ~100m in lat
    const lngInc = 0.0027250000000003105 / 2; // ~100m in lng
    const radius = 200 / 2; // 100m
    const restaurants: {[key: string]: Place} = {};

    for (let lat = params.minLat; lat <= params.maxLat; lat += latInc) {
      for (let lng = params.minLng; lng <= params.maxLng; lng += lngInc) {
        let resultCount = 0;
        // eslint-disable-next-line no-await-in-loop
        for await (const newRestaurants of this.getRestaurantsNearby({ lat, lng, radius })) {
          for (const newRestaurant of newRestaurants) {
            resultCount += 1;
            if (!newRestaurant.place_id) {
              console.error('A restaurant was found without ID ! Well played, Google !');
            } else {
              restaurants[newRestaurant.place_id] = newRestaurant;
            }
          }
        }
        console.log(`${resultCount} restaurants found in a circle of ${radius} meters around ${lat},${lng}.`);
        if (resultCount >= 60) {
          console.error('You should maybe reduce circle\'s radius');
        }
      }
    }
    return Object.values(restaurants);
  }

  /**
   * Get all restaurants in a circle of the given `radius` around the point located at `lat`,`lng`
   * Only 60 results can be retrieved at once. If that's not enough, reduce the search circle
   *
   * @param lat Latitude of the center
   * @param lng Longitude of the center
   * @param radius Radius (in meter) of the search circle
   * @return iterator on restaurant pages (20 items per page)
   * @example
   * for await (const restaurants of gPlacesClient.getRestaurantsNearby({
   *   lat: 48.8566,
   *   lng: 2.3522,
   *   radius: 1500,
   * })) {
   *    console.log(restaurants.length);
   * }
   */
  async* getRestaurantsNearby(params: {
    lat: number;
    lng: number;
    radius: number;
  }) {
    let nextPageToken: string | undefined;
    let done = false;

    while (!done) {
      // Sleep 3s before accessing new page, to let Google some time to generate it
      // eslint-disable-next-line no-await-in-loop
      if (nextPageToken) await new Promise((resolve) => setTimeout(resolve, 3000));

      // eslint-disable-next-line no-await-in-loop
      const res = await this.client.get('maps/api/place/nearbysearch/json', {
        params: {
          location: `${params.lat},${params.lng}`,
          type: PlaceType1.restaurant,
          radius: params.radius,
          key: this.key,
          pagetoken: nextPageToken,
        },
      });
      if (res.status >= 300) {
        console.error('An error occured !');
        return;
      }

      nextPageToken = res.data.next_page_token;
      if (!nextPageToken) {
        done = true;
      }
      yield res.data.results as Array<Place>;
    }
  }
}


async function test() {
  const gPlacesClient = new GPlacesClient('AIzaSyAPUn2r10zmq_JEauPmsFWINsWk4avl3cc', false);
  const restaurants = await gPlacesClient.getAllRestaurantsBetween({
    minLat: 48.883731,
    maxLat: 48.897501,
    minLng: 2.328813,
    maxLng: 2.370398,
  });
  console.log(`Retrieved ${restaurants.length} restaurants in Paris XXVIIIème`);
  restaurants.forEach((restaurant) => console.log(restaurant.name));
  console.log(restaurants[0]);
}

test();
