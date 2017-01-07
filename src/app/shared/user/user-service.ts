import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

import { UserModel } from './user.model';
import { UserReady } from './user-notifier';
import { CarModel } from '../../car/car.model';
import { CarParkModel } from '../../car-park/car-park.model';
import { ProfileTypesEnum } from '../profile-types.enum';
import { ServiceUtils } from '../service.utils';


@Injectable()
export class UserService extends ServiceUtils {

  private refDatabase: firebase.database.Reference;
  private refStorageUsers: firebase.storage.Reference;

  private currentUser: UserModel;

  constructor(public userReady: UserReady) {
    super();
    this.refDatabase = firebase.database().ref();
    this.refStorageUsers = firebase.storage().ref('users');
  }

  getCurrent(cache: boolean = true): Promise<UserModel> {
    if (cache && this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      return new Promise((resolve, reject) =>
        firebase.auth().onAuthStateChanged(resolve, reject)).then((user: firebase.User) => {
        return this.refDatabase.child('users').child(user.uid).once('value')
          .then(snapshot => {
            this.currentUser = snapshot.val();
            this.currentUser.cars = this.arrayFromObject(this.currentUser.cars);
            this.currentUser.carParks = this.arrayFromObject(this.currentUser.carParks);
            this.userReady.notify(true);
            return this.currentUser;
          });
      });
    }
  }

  login(userModel: UserModel, password: string) {
    return firebase.auth().signInWithEmailAndPassword(userModel.email, password)
      .then(() => this.getCurrent());
  }

  facebookLogin() {
    return Promise.reject('not implemented yet');
    //return firebase.auth().signInWithPopup();
    //return Facebook.login(['public_profile', 'email'])
    //  .then(userDataFb => {
    //    //let loading = this.loadingCtrl.create({
    //    //  content: 'Loading',
    //    //  spinner: 'crescent',
    //    //  showBackdrop: false
    //    //});
    //    //loading.present();
    //    console.log("fb native auth success: ", userDataFb);
    //    let facebookCredential = firebase.auth.FacebookAuthProvider
    //      .credential(userDataFb.authResponse.accessToken);
    //    return firebase.auth().signInWithCredential(facebookCredential)
    //      .then(userData => {
    //        console.log("firebase auth success: ", userData);
    //        //loading.dismissAll();
    //        return userData;
    //      }, err => {
    //        //loading.dismissAll();
    //        return err;
    //      });
    //  });
  }

  create(user: UserModel, password: string, car: CarModel, carPark: CarParkModel) {
    return firebase.auth().createUserWithEmailAndPassword(user.email, password)
      .then(() => {
        let carOrCarPark;
        let carOrCarParkId;
        let updates = {};
        user.uid = firebase.auth().currentUser.uid;
        if (user.profile === ProfileTypesEnum.client) {
          let newCarId = this.refDatabase.child('cars').push().key;
          car.userUid = user.uid;
          car.id = newCarId;
          updates['cars/' + newCarId] = car;
          updates['users/' + user.uid + '/cars/' + newCarId] = car;
        } else if (user.profile === ProfileTypesEnum.manager) {
          let newCarParkId = this.refDatabase.child('carParks').push().key;
          carPark.userUid = user.uid;
          carPark.id = newCarParkId;
          carPark.nbFreePlaces = carPark.nbPlaces;
          updates['carParks/' + newCarParkId] = carPark;
          updates['users/' + user.uid + '/carParks/' + newCarParkId] = carPark;
        }
        return this.refDatabase.child('users').child(user.uid).set(user).then(() => {
            this.refDatabase.update(updates)
              .then(() => {
                car ? user.cars = [car] : '';
                carPark ? user.carParks = [carPark] : '';
                this.currentUser = user;
                this.userReady.notify(true);
              })
          });
      });
  }

  isAuth(): Promise<boolean> {
    return this.currentUser ? Promise.resolve(true) : new Promise((resolve, reject) =>
      firebase.auth().onAuthStateChanged(resolve, reject))
      .then((user: firebase.User) => {
        this.userReady.notify(Boolean(user));
        return Boolean(user);
      });
  }

  logOut() {
    this.currentUser = undefined;
    firebase.auth().signOut();
  }

  updatePassword(newPassword: string) {
    return firebase.auth().currentUser.updatePassword(newPassword);
  }

  /**
   * Update the user informations
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  updateUserInfo(user: UserModel) {
    return this.refDatabase.child('users').child(user.uid).update(user)
      .then(() => this.currentUser = user);
  }

  /**
   * Send email to the user to reset his password
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  resetPassword(user: UserModel) {
    return firebase.auth().sendPasswordResetEmail(user.email);
  }

  /**
   * Update user auth email if changed then user info
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  private updateUserAuthEmail(user: UserModel) {
    if (firebase.auth().currentUser.email !== user.email) {
      return firebase.auth().currentUser.updateEmail(user.email)
        .then(() => this.updateUserInfo(user));
    } else {
      return this.updateUserInfo(user);
    }
  }
}
