import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserModel } from '../../user/user.model';
import { CarParkModel } from './car-park.model';
import { ServiceUtils } from '../../shared/service.utils';
import { Region } from '../car-park-filter/region.enum';
import { CarParkFilterModel } from '../car-park-filter/car-park-filter.model';
import { SubscriptionModel } from '../../shared/subscription/subscription.model';
import { Observable } from "rxjs";

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
    updates['carParks/' + carPark.region + '/' + carPark.area.toLowerCase() + '/' + carPark.id] = null;
    return this.refDatabase.update(updates);
  }

  add(user: UserModel, newCarPark: CarParkModel) {
    user.carParks.push(newCarPark);
    newCarPark.id = this.refDatabase.child('carParks').push().key;

    let updates = {};
    updates['users/' + newCarPark.userUid + '/carParks/' + newCarPark.id] = newCarPark;
    updates['carParks/' + newCarPark.region + '/' + newCarPark.area.toLowerCase() + '/' + newCarPark.id] = newCarPark;
    updates['areas/' + newCarPark.region + '/' + newCarPark.area.toLowerCase()] = true;
    return this.refDatabase.update(updates);
  }

  update(updatedCarPark: CarParkModel, region: Region, area: string) {
    let updates = {};
    updates['users/' + updatedCarPark.userUid + '/carParks/' + updatedCarPark.id] = updatedCarPark;
    // Only admin can change region or area from firebase console
    updates['carParks/' + region + '/' + area.toLowerCase() + '/' + updatedCarPark.id] = updatedCarPark;
    updates['areas/' + region + '/' + area.toLowerCase()] = true;

    let oldRegion = updatedCarPark.region;
    let oldArea = updatedCarPark.area;
    if (oldRegion && oldRegion !== region && oldArea && oldArea !== area) {
      updates['carParks/' + oldRegion + '/' + oldArea + '/' + updatedCarPark.id] = null;
    } else if (oldRegion && oldRegion !== region) {
      updates['carParks/' + oldRegion + '/' + area + '/' + updatedCarPark.id] = null;
    } else if (oldArea && oldArea !== area) {
      updates['carParks/' + region + '/' + oldArea + '/' + updatedCarPark.id] = null;
    }

    updatedCarPark.region = region;
    updatedCarPark.area = area;

    return this.refDatabase.update(updates);
  }

  getAll(): firebase.Promise<Array<CarParkModel>> {
    return this.refDatabase.child('carParks').once('value')
      .then(snapshot => {
        return this.arrayFromObject(snapshot.val())
          .map(carparcsTreeByCardinal =>
            this.arrayFromObject(carparcsTreeByCardinal)
              .reduce((result, value) => result.concat(value), []))
          .reduce((result, value) => result.concat(value), [])
          .map((carparcObject: CarParkModel) => this.arrayFromObject(carparcObject)[0]);
      });
  }

  getBySubscription(subscriptionModel: SubscriptionModel): firebase.Promise<CarParkModel> {
    return this.refDatabase.child('carParks').child(subscriptionModel.carParkRegion)
      .child(subscriptionModel.carParkArea).child(subscriptionModel.carParkId).once('value')
      .then(snapshot => snapshot.val());
  }

  getFiltered(areaOrCardinalPart: CarParkFilterModel): firebase.Promise<Array<CarParkModel>> {
    if (areaOrCardinalPart.code) {
      return this.refDatabase.child('areas').once('value')
        .then(snapshot => {
          let regions = snapshot.val();
          let carparksPromise = new Array();
          for (let region of Object.keys(regions)) {
            for (let area of Object.keys(regions[region])) {
              carparksPromise.push(this.refDatabase.child('carParks').child(region).child(area)
                .orderByChild('code').startAt(areaOrCardinalPart.code).once('value')
                .then(snapshot => this.arrayFromObject(snapshot.val())));
            }
          }
          return Observable.forkJoin(carparksPromise).toPromise()
            .then((value: Array<Array<Object>>) => {
              return this.mergeResults(value);
            });
        });
    } else if (areaOrCardinalPart.area) {
      return this.refDatabase.child('carParks').child(areaOrCardinalPart.region).child(areaOrCardinalPart.area).once('value')
        .then(snapshot => this.arrayFromObject(snapshot.val()));
    } else {
      return this.refDatabase.child('carParks').child(areaOrCardinalPart.region).once('value')
        .then(snapshot => {
          return this.arrayFromObject(snapshot.val())
            .map(carParkCardinalPart => this.arrayFromObject(carParkCardinalPart))
            .reduce((result, value) => result.concat(value), [])
        });
    }
  }

  getAreasByRegion(cardinalPart: Region) {
    return this.refDatabase.child('areas').child(cardinalPart).once('value')
      .then(snapshot => Object.keys(snapshot.val() ? snapshot.val() : []));
  }

  get selectedCarPark(): CarParkModel {
    return this._selectedCarPark;
  }

  set selectedCarPark(value: CarParkModel) {
    this._selectedCarPark = value;
  }

}
