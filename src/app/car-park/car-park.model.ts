import { SubscriptionModel } from '../shared/subscription/subscription.model';

export class ParkPlaceModel {
  idCarSubscribed: string;
}

export class CarParkModel {

  id: string;
  userUid: string;
  subscriptions: Array<SubscriptionModel>;

  name: string;
  address: string;
  // if unlocked: client can subscribe his selectedCar for a wash
  locked: boolean;
  parkPlaces: Array<ParkPlaceModel>;
  nbPlaces: number;
  nbFreePlaces: number;

  constructor() {
    this.address = '';
    // if unlocked: client can subscribe his selectedCar for a wash
    this.locked = true;
    this.parkPlaces = new Array<ParkPlaceModel>();
    this.subscriptions = new Array<SubscriptionModel>();
    this.nbPlaces = 0;
    this.nbFreePlaces = 0;
  }
}
