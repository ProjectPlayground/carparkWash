import { SubscriptionModel } from '../../shared/subscription/subscription.model';

export class CarModel {
  name: string;
  subscription: SubscriptionModel;
  licencePlateNumber: string;
  silhouettePicture: SilhouettePictureType;
  brandModel: string;
  colour: string;
  userUid: string;

}

export type SilhouettePictureType = 'SEDAN' | 'SUV';

export const SilhouettePictureTypeEnum = {
  SEDAN: 'SEDAN' as SilhouettePictureType,
  SUV: 'SUV' as SilhouettePictureType,
};
