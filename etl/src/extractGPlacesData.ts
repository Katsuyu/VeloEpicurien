import axios, { AxiosInstance } from 'axios';
import { Place } from '@googlemaps/google-maps-services-js';

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

  async* getRestaurantsIn(city: string) {
    let nextPageToken: string | undefined;
    let done = false;

    while (!done) {
      // eslint-disable-next-line no-await-in-loop
      const res = await this.client.get('maps/api/place/textsearch/json', {
        params: {
          query: `restaurants in ${city}`,
          key: this.key,
          pagetoken: nextPageToken,
        },
      });
      if (res.status >= 300) {
        console.error(`An error occured ! Cannot retrieve new restaurants in ${city}`);
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
  for await (const restaurants of gPlacesClient.getRestaurantsIn('paris')) {
    console.log(restaurants.length);
  }
}

test();
