import { SubscriptionModel } from '../shared/subscription/subscription.model';
export class CarModel {

  id: string;
  subscription: SubscriptionModel;
  licencePlateNumber: string;
  // regular, suv
  type: string;
  brandModel: string;
  colour: string;
  userUid: string;

}
