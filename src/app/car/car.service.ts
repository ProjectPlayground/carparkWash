import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { CarModel } from './car.model';
import { UserModel } from '../shared/user/user.model';
import { CarParkModel } from '../car-park/car-park.model';
import { ServiceUtils } from '../shared/service.utils';

@Injectable()
export class CarService extends ServiceUtils {

  private _selectedCar: CarModel;

  private refDatabase: firebase.database.Reference;

  constructor() {
    super();
    this.refDatabase = firebase.database().ref();
  }

  remove(car: CarModel) {
    let updates = {};
    updates['users/' + car.userUid + '/cars/' + car.id] = null;
    updates['cars/' + car.id] = null;
    return this.refDatabase.update(updates);
  }

  add(user: UserModel, newCar: CarModel) {
    user.cars.push(newCar);
    let newCarId = this.refDatabase.child('cars').push().key;
    newCar.id = newCarId;

    let updates = {};
    updates['users/' + newCar.userUid + '/cars/' + newCar.id] = newCar;
    updates['cars/' + newCarId] = newCar;
    return this.refDatabase.update(updates);
  }

  update(updatingCar: CarModel) {
    let updates = {};
    updates['users/' + updatingCar.userUid + '/cars/' + updatingCar.id] = updatingCar;
    updates['cars/' + updatingCar.id] = updatingCar;
    return this.refDatabase.update(updates);
  }

  get selectedCar(): CarModel {
    return this._selectedCar;
  }

  set selectedCar(value: CarModel) {
    this._selectedCar = value;
  }

  getByCarPark(carPark: CarParkModel) {
    return this.refDatabase.child('carParks').child(carPark.id).child('subscriptions').once('value')
      .then(snapshot => this.arrayFromObject(snapshot.val()));
  }
}
