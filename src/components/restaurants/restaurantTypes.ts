import { Ro } from '../../appRo';

export interface RestaurantRo extends Ro {
  id: string;
  registeredAt: Date;
  name: string;
}
