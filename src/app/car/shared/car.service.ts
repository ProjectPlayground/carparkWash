import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { CarModel } from './car.model';
import { UserModel } from '../../user/user.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { ServiceUtils } from '../../shared/service.utils';
import { UserService } from '../../user/user-service';

@Injectable()
export class CarService extends ServiceUtils {

  private _selectedCar: CarModel;

  private refDatabase: firebase.database.Reference;

  constructor(public userService: UserService) {
    super();
    this.refDatabase = firebase.database().ref();
  }

  remove(car: CarModel) {
    let updates = {};
    updates['users/' + car.userUid + '/cars/' + car.name] = null;
    updates['cars/' + car.name] = null;
    return this.refDatabase.update(updates);
  }

  add(user: UserModel, newCar: CarModel) {
    user.cars.push(newCar);
    newCar.name = this.refDatabase.child('cars').push().key;

    let updates = {};
    updates['users/' + newCar.userUid + '/cars/' + newCar.name] = newCar;
    updates['cars/' + newCar.name] = newCar;
    return this.refDatabase.update(updates)
      .then(() => this.userService.getCurrent(true));
  }

  update(updatingCar: CarModel) {
    let updates = {};
    updates['users/' + updatingCar.userUid + '/cars/' + updatingCar.name] = updatingCar;
    updates['cars/' + updatingCar.name] = updatingCar;
    return this.refDatabase.update(updates);
  }

  get selectedCar(): CarModel {
    return this._selectedCar;
  }

  set selectedCar(value: CarModel) {
    this._selectedCar = value;
  }

  getByCarPark(carPark: CarParkModel) {
    return this.refDatabase.child('carParks').child(carPark.region).child(carPark.area)
      .child(carPark.id).child('subscriptions').once('value')
      .then(snapshot => this.arrayFromObject(snapshot.val()));
  }
}
