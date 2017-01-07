import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { CarParkModel } from '../../car-park/car-park.model';
import { ServiceUtils } from '../service.utils';
import { SubscriptionModel, DayCleanerModel } from './subscription.model';
import { CarModel } from '../../car/car.model';
import { WashStateEnum } from './wash-state.enum';
import { UserModel } from '../user/user.model';

@Injectable()
export class SubscriberService extends ServiceUtils {

  private refDatabase: firebase.database.Reference;

  constructor() {
    super();
    this.refDatabase = firebase.database().ref();
  }

  subscribe(carPark: CarParkModel, car: CarModel) {
    let subscriptionModel = new SubscriptionModel();
    subscriptionModel.userUid = car.userUid;
    subscriptionModel.carParkId = carPark.id;
    subscriptionModel.carId = car.id;
    subscriptionModel.car = car;

    let updates = {};
    let subCarPath = 'cars/' + car.id + '/subscription';
    updates['users/' + car.userUid + '/' + subCarPath] = subscriptionModel;
    updates[subCarPath] = subscriptionModel;

    let subCarParkPath = 'carParks/' + carPark.id + '/subscriptions/' + car.id;
    updates['users/' + carPark.userUid + '/' + subCarParkPath] = subscriptionModel;
    updates[subCarParkPath] = subscriptionModel;
    //updates['subscriptions/' + carPark.id + '/' + subscriptionModel.id] = subscriptionModel;

    return this.refDatabase.update(updates);
  }

  setToWashed(subscription: SubscriptionModel, cleaner: UserModel) {
    let dayIndex = Math.round((new Date().getTime() - subscription.dateSubscription) / (1000*60*60*24));
    let dayCleanerModel = new DayCleanerModel(dayIndex);
    dayCleanerModel.washDate = new Date().getTime();
    dayCleanerModel.washStatus = WashStateEnum.washed;
    dayCleanerModel.cleanerUid = cleaner.uid;
    let updates = {};
    let subCarPath = 'cars/' + subscription.car.id + '/subscription/days/' + dayIndex;
    updates['users/' + subscription.userUid + '/' + subCarPath] = dayCleanerModel;
    updates[subCarPath] = dayCleanerModel;

    let subCarParkPath = 'carParks/' + subscription.carParkId + '/subscriptions/' + subscription.car.id + '/days/' + dayIndex;
    updates['users/' + subscription.userUid + '/' + subCarParkPath] = dayCleanerModel;
    updates[subCarParkPath] = dayCleanerModel;

    return this.refDatabase.update(updates);
  }
}
