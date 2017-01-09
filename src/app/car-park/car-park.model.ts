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
  // if unlocked: client can book his selectedCar for a wash
  // unlocked contains the date of unlock
  unlocked: number;
  parkPlaces: Array<ParkPlaceModel>;
  nbPlaces: number;
  nbFreePlaces: number;

  constructor() {
    this.address = '';
    // if unlocked: client can subscribe his selectedCar for a wash
    this.unlocked = 0;
    this.parkPlaces = new Array<ParkPlaceModel>();
    this.subscriptions = new Array<SubscriptionModel>();
    this.nbPlaces = 0;
    this.nbFreePlaces = 0;
  }
}
