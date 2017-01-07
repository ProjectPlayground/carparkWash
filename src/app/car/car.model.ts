export class CarModel {

  id: string;
  subscriptionId: string;
  isSubscribed: boolean;
  licencePlateNumber: string;
  // regular, suv
  type: string;
  brandModel: string;
  colour: string;
  userUid: string;

  constructor() {
    this.isSubscribed = false;
  }
}
