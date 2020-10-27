import axios, { AxiosInstance } from 'axios';
import { Place, PlaceType1 } from '@googlemaps/google-maps-services-js';


class GPlacesClient {
  private readonly client: AxiosInstance;

  private readonly key: string;

  constructor(apiKey: string) {
    this.key = apiKey;
    this.client = axios.create({
      baseURL: 'https://maps.googleapis.com/',
      validateStatus: (status) => true,
    });

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

  /**
   * Get all restaurants in a circle of the given `radius` arount the point located at `lat`,`lng`
   * Only 60 results can be retrieved at once. If that's not enough, reduce the search circle
   *
   * @param lat Latitude of the center
   * @param lng Longitude of the center
   * @param radius Radius (in meter) of the search circle
   * @return iterator on restaurant pages (20 items per page)
   * @example
   * for await (const restaurants of gPlacesClient.getRestaurantsNearby({
   *   lat: -27.12344,
   *   lng: 48.983,
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

  /**
   * Get all restaurants in a specific city
   * Only 60 results can be retrieved at once - prefer using getRestaurantsNearby
   *
   * @param city The city where to fin restaurants
   * @return iterator on restaurant pages (20 items per page)
   * @example
   * for await (const restaurants of gPlacesClient.getRestaurantsIn('paris')) {
   *    console.log(restaurants.length);
   * }
   */
  async* getRestaurantsIn(city: string) {
    let nextPageToken: string | undefined;
    let done = false;

    while (!done) {
      // Sleep 3s before accessing new page, to let Google some time to generate it
      // eslint-disable-next-line no-await-in-loop
      if (nextPageToken) await new Promise((resolve) => setTimeout(resolve, 3000));

      // eslint-disable-next-line no-await-in-loop
      const res = await this.client.get('maps/api/place/textsearch/json', {
        params: {
          query: `${PlaceType1.restaurant} in ${city}`,
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
  const gPlacesClient = new GPlacesClient('AIzaSyAPUn2r10zmq_JEauPmsFWINsWk4avl3cc');
  for await (const restaurants of gPlacesClient.getRestaurantsNearby({
    lat: 48.8566,
    lng: 2.3522,
    radius: 200,
  })) {
    console.log(restaurants.length);
    restaurants.forEach((restaurant) => console.log(restaurant.name));
  }
}

test();
