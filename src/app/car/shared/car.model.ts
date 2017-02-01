import { SubscriptionModel } from '../../shared/subscription/subscription.model';

export class CarModel {

  id: string;
  subscription: SubscriptionModel;
  licencePlateNumber: string;
  type: CarType;
  brandModel: string;
  colour: string;
  userUid: string;

}

export type CarType = 'SEDAN' | 'SUV';

export const CarTypeEnum = {
  SEDAN: 'SEDAN' as CarType,
  SUV: 'SUV' as CarType,
};
