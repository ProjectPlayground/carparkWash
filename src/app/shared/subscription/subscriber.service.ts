import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { ServiceUtils } from '../service.utils';
import { SubscriptionModel, DayCleanerModel } from './subscription.model';
import { CarModel } from '../../car/shared/car.model';
import { WashStateEnum } from './wash-state.enum';
import { UserModel } from '../../user/user.model';

@Injectable()
export class SubscriberService extends ServiceUtils {

  private refDatabase: firebase.database.Reference;

  constructor() {
    super();
    this.refDatabase = firebase.database().ref();
  }

  subscribe(carPark: CarParkModel, car: CarModel) {
    return new Promise((resolve, reject) => {
      //TODO put the right stripe key
      (<any>window).StripeCheckout.configure({
        key: 'pk_test_oi0sKPJYLGjdvOXOM8tE8cMa',
        locale: 'auto',
        token: resolve
      }).open({
        name: '30 day Car Wash',
        description: `Subscribe ${car.licencePlateNumber} in ${carPark.name}`,
        amount: 3000
      });
    }).then(token => {
      // You can access the token ID with `token.id`.
      // Get the token ID to your server-side code for use.
      console.log(token);
      //TODO test on real card
      console.log('test if transaction is ok');
      let subscriptionModel = new SubscriptionModel();
      subscriptionModel.clientUid = car.userUid;
      subscriptionModel.managerUid = carPark.userUid;
      subscriptionModel.carParkId = carPark.id;
      subscriptionModel.carParkRegion = carPark.region;
      subscriptionModel.carParkArea = carPark.area;
      subscriptionModel.carId = car.id;
      subscriptionModel.car = car;

      let updates = {};
      let subCarPath = 'cars/' + car.id + '/subscription';
      updates['users/' + car.userUid + '/' + subCarPath] = subscriptionModel;
      updates[subCarPath] = subscriptionModel;

      let subCarParkPath = carPark.id + '/subscriptions/' + car.id;
      updates['users/' + carPark.userUid + '/carParks/' + subCarParkPath] = subscriptionModel;
      updates[this.carParkPrePAth(carPark) + '/' + subCarParkPath] = subscriptionModel;

      subscriptionModel.id = this.refDatabase.child('historySubscription').child(car.userUid).push().key;
      updates['historySubscription/' + car.userUid + '/' + subscriptionModel.id] = subscriptionModel;
      return this.refDatabase.update(updates)
        .then(() => {
          car.subscription = subscriptionModel;
          if (carPark.subscriptions) {
            carPark.subscriptions.push(subscriptionModel);
          } else {
            carPark.subscriptions = [subscriptionModel];
          }
        });
    });
  }

  unlock(carPark: CarParkModel) {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    carPark.unlocked = tomorrow.getTime();
    let updates = {};
    updates['users/' + carPark.userUid + '/carParks/' + carPark.id] = carPark;
    updates[this.carParkPrePAth(carPark) + '/' + carPark.id] = carPark;
    return this.refDatabase.update(updates);
  }

  selectToBeWashed(subscription: SubscriptionModel, carParkLotNumber: string) {
    let dayIndex = Math.round((new Date().getTime() - subscription.dateSubscription) / (1000 * 60 * 60 * 24));
    let dayCleanerModel = subscription.days[dayIndex];
    dayCleanerModel.washRequestDate = new Date().getTime();
    dayCleanerModel.washStatus = WashStateEnum.toWash;
    dayCleanerModel.carParkLotNumber = carParkLotNumber;
    let updates = {};
    let subCarPath = 'cars/' + subscription.carId + '/subscription/days/' + dayIndex;
    updates['users/' + subscription.clientUid + '/' + subCarPath] = dayCleanerModel;
    updates[subCarPath] = dayCleanerModel;

    let subDayPath = subscription.carParkId + '/subscriptions/' + subscription.carId + '/days/' + dayIndex;
    updates['users/' + subscription.managerUid + '/carParks/' + '/' + subDayPath] = dayCleanerModel;
    updates[this.carParkPrePAth(subscription) + '/' + subDayPath] = dayCleanerModel;

    updates['historySubscription/' + subscription.clientUid + '/' + subscription.id] = subscription;
    return this.refDatabase.update(updates);
  }

  setToWashed(subscription: SubscriptionModel, cleaner: UserModel) {
    let dayIndex = Math.round((new Date().getTime() - subscription.dateSubscription) / (1000 * 60 * 60 * 24));
    let dayCleanerModel = subscription.days[dayIndex];
    dayCleanerModel.washDate = new Date().getTime();
    dayCleanerModel.washStatus = WashStateEnum.washed;
    dayCleanerModel.cleanerUid = cleaner.uid;
    dayCleanerModel.cleanerName = cleaner.name;
    let updates = {};
    let subCarPath = 'cars/' + subscription.carId + '/subscription/days/' + dayIndex;
    updates['users/' + subscription.clientUid + '/' + subCarPath] = dayCleanerModel;
    updates[subCarPath] = dayCleanerModel;

    let subDayPath = subscription.carParkId + '/subscriptions/' + subscription.carId + '/days/' + dayIndex;
    updates['users/' + subscription.managerUid + '/carParks/' + subDayPath] = dayCleanerModel;
    updates[this.carParkPrePAth(subscription) + '/' + subDayPath] = dayCleanerModel;

    updates['historySubscription/' + subscription.clientUid + '/' + subscription.id] = subscription;
    return this.refDatabase.update(updates);
  }

  private carParkPrePAth(carPark: SubscriptionModel | CarParkModel) {
    if ((<SubscriptionModel>carPark).carParkRegion) {
      return 'carParks/' + (<SubscriptionModel>carPark).carParkRegion + '/' + (<SubscriptionModel>carPark).carParkArea;
    } else {
      return 'carParks/' + (<CarParkModel>carPark).region + '/' + (<CarParkModel>carPark).area;
    }
  }
}
