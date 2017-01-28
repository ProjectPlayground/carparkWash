import { CarModel } from '../car/shared/car.model';
import { Profile } from './profile.enum';
import { CarParkModel } from '../car-park/shared/car-park.model';

export class UserModel {

  uid: string;
  email: string;
  name: string;
  address: string;
  phoneNumber: string;
  provider: ProviderType;
  profile: Profile;
  cars: Array<CarModel>;
  carParks: Array<CarParkModel>;

  constructor() {
    this.uid = '';
    this.name = '';
    this.email = '';
    this.address = '';
    this.phoneNumber = '';
    //this.profile = ProfileTypeEnum.client;
    this.cars = new Array<CarModel>();
    this.carParks = new Array<CarParkModel>();
  }

}

export type ProviderType = 'email' | 'facebook';

export const ProviderTypeEnum = {
  email: 'email' as ProviderType,
  facebook: 'facebook' as ProviderType,
};
