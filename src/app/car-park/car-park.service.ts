import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserModel } from '../shared/user/user.model';
import { CarParkModel } from './car-park.model';
import { ServiceUtils } from '../shared/service.utils';

@Injectable()
export class CarParkService extends ServiceUtils {

  private _selectedCarPark: CarParkModel;
  private refDatabase: firebase.database.Reference;

  constructor() {
    super();
    this.refDatabase = firebase.database().ref();
  }

  remove(carPark: CarParkModel) {
    let updates = {};
    updates['users/' + carPark.userUid + '/carParks/' + carPark.id] = null;
    updates['carParks/' + carPark.id] = null;
    return this.refDatabase.update(updates);
  }

  add(user: UserModel, newCarPark: CarParkModel) {
    user.carParks.push(newCarPark);
    let newCarParkId = this.refDatabase.child('carParks').push().key;
    newCarPark.id = newCarParkId;

    let updates = {};
    updates['users/' + newCarPark.userUid + '/carParks/' + newCarPark.id] = newCarPark;
    updates['carParks/' + newCarParkId] = newCarPark;
    return this.refDatabase.update(updates);
  }

  update(updatingCarPark: CarParkModel) {
    let updates = {};
    updates['users/' + updatingCarPark.userUid + '/carParks/' + updatingCarPark.id] = updatingCarPark;
    updates['carParks/' + updatingCarPark.id] = updatingCarPark;
    return this.refDatabase.update(updates);
  }

  getAll() {
    return this.refDatabase.child('carParks').once('value')
      .then(snapshot => this.arrayFromObject(snapshot.val()));
  }

  getById(carParkId: string): firebase.Promise<CarParkModel>{
    return this.refDatabase.child('carParks').orderByKey().equalTo(carParkId).once('value')
      .then(snapshot => snapshot.val()[carParkId]);
  }

  get selectedCarPark(): CarParkModel {
    return this._selectedCarPark;
  }

  set selectedCarPark(value: CarParkModel) {
    this._selectedCarPark = value;
  }
}
