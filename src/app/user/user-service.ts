import { Injectable, Provider } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

import { UserModel, ProviderTypeEnum } from './user.model';
import { UserReady } from './user-notifier';
import { CarModel } from '../car/shared/car.model';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { ProfileEnum } from './profile.enum';
import { ServiceUtils } from '../shared/service.utils';
import { FirebaseService } from '../shared/firebase-service';


@Injectable()
export class UserService extends ServiceUtils {

  private refDatabase: firebase.database.Reference;
  private refStorageUsers: firebase.storage.Reference;

  private currentUser: UserModel;
  private accessToken: string;

  constructor(public firebaseService: FirebaseService, public userReady: UserReady) {
    super();
    this.refDatabase = firebase.database().ref();
    this.refStorageUsers = firebase.storage().ref('users');
  }

  getIfSet() {
    if (this.currentUser) {
      return this.currentUser;
    } else {
      return null;
    }
  }

  getCurrent(cache: boolean = true, userFb?: UserModel): Promise<UserModel> {
    if (cache && this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      return new Promise((resolve, reject) => {
        return firebase.auth().onAuthStateChanged(resolve, reject)
      }).then((userAuth: firebase.User) => {
        userAuth.getToken().then(token => this.accessToken = token);
        //this.accessToken = userAuth.refreshToken;
        return this.refDatabase.child('users').child(userAuth.uid).once('value').then(snapshot => {
          this.currentUser = snapshot.val();
          if (this.currentUser === null) {
            return this.createUserModel(userFb);
          } else {
            this.currentUser.cars = this.arrayFromObject(this.currentUser.cars);
            this.currentUser.carParks = this.arrayFromObject(this.currentUser.carParks);
            this.userReady.notify(true);
            return this.currentUser;
          }
        }).catch(error => {
          console.log(error);
          throw error;
        });
      });
    }
  }

  login(userModel: UserModel, password: string) {
    return firebase.auth().signInWithEmailAndPassword(userModel.email, password).then(userAuth => {
      userAuth.getToken().then(token => this.accessToken = token);
      return this.getCurrent();
    }).catch((err: firebase.FirebaseError) => {
      console.error(err);
      let errMsg: string = 'Log in Fail';
      switch (err.code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errMsg = 'Incorrect email or password';
          break;
        case 'auth/unverified-email':
          errMsg = 'Email not verified';
          break;
      }
      throw {code: err.code, message: errMsg};
    });
  }

  /**
   * if userModel is undefined => a client login, else admin creating a user(Manager/Cleaner)
   *
   * @param userModel
   * @returns {firebase.Thenable<any>}
   */
  facebookLogin(userModel?: UserModel, carParkModel?: CarParkModel) {
    let provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('user_birthday');
    provider.addScope('user_location');
    provider.setCustomParameters({
      'display': 'popup'
    });
    return firebase.auth().signInWithPopup(provider).then(result => {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      this.accessToken = result.credential.accessToken;
      let userFb = new UserModel();
      userFb.uid = result.user.uid;
      userFb.provider = ProviderTypeEnum.facebook;
      userFb.name = result.user.displayName;
      userFb.email = result.user.email;
      userFb.address = result.user.location ? result.user.location : '';
      if (userModel) {
        userFb.address ? '' : userFb.address = userModel.address;
        userFb.phoneNumber = userModel.phoneNumber;
        userFb.profile = userModel.profile;
        return this.createUserModel(userFb, carParkModel);
      } else {
        // client login/sign up with facebook
        userFb.profile = ProfileEnum.client;
        return this.getCurrent(false, userFb);
      }
    }).catch((error: any) => {
      // Handle Errors here.
      //let errorCode = error.code;
      //let errorMessage = error.message;
      // The email of the user's account used.
      //let email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      //let credential = error.credential;
      throw error;
    });
  }

  create(user: UserModel, password: string, stayConnected: boolean, carPark?: CarParkModel, car?: CarModel) {
    let authApp = stayConnected ? firebase.auth() : this.firebaseService.initAnotherAppAuth();
    return authApp.createUserWithEmailAndPassword(user.email, password)
      .then(() => {
        user.uid = authApp.currentUser.uid;
        user.provider = ProviderTypeEnum.email;
        return this.createUserModel(user, carPark, car)
          .then(() => this.sentEmailVerification())
          .catch((err: any) => {
            if (err.code === 'auth/email-already-in-use' && authApp.currentUser
                  && !authApp.currentUser.emailVerified) {
              return Promise.reject({
                code: 'auth/email-already-in-use-but-not-verified',
                message: ['email already in use but not yet verified,', 'Re-sent verification email ?']
              });
            }
            return Promise.reject(err);
          });
      });
  }

  sentEmailVerification() {
    return firebase.auth().currentUser.sendEmailVerification().then(() => {
      console.log("sendEmailVerification success");
    });
  }

  private createUserModel(user: UserModel, carPark?: CarParkModel, car?: CarModel) {
    let updates = {};

    if (user.profile === ProfileEnum.client && car) {
      let newCarId = this.refDatabase.child('cars').push().key;
      car.userUid = user.uid;
      car.name = newCarId;
      updates['cars/' + newCarId] = car;
      updates['users/' + user.uid + '/cars/' + newCarId] = car;
    } else if (user.profile === ProfileEnum.manager && carPark) {
      let newCarParkId = this.refDatabase.child('carParks').push().key;
      carPark.userUid = user.uid;
      carPark.id = newCarParkId;
      //carPark.nbFreePlaces = carPark.nbPlaces;
      updates['carParks/' + carPark.region + '/' + carPark.area.toLowerCase() + '/' + newCarParkId] = carPark;
      updates['areas/' + carPark.region + '/' + carPark.area.toLowerCase()] = true;
      updates['users/' + user.uid + '/carParks/' + newCarParkId] = carPark;
    }

    return this.refDatabase.child('users').child(user.uid).set(user).then(() => {
      return this.refDatabase.update(updates).then(() => {
        car ? user.cars = [car] : '';
        carPark ? user.carParks = [carPark] : '';
        if (!this.currentUser || this.currentUser.profile === ProfileEnum.admin) {
          //return firebase.auth().signInWithCustomToken(this.accessToken);
        } else if (!this.currentUser || this.currentUser.profile !== ProfileEnum.admin) {
          this.currentUser = user;
          this.userReady.notify(true);
          return this.currentUser;
        }
      });
    });
  }

  isAuth(): Promise<boolean> {
    return this.currentUser ? Promise.resolve(true) : new Promise((resolve, reject) =>
        firebase.auth().onAuthStateChanged(resolve, reject)).then((user: firebase.User) => {
        this.userReady.notify(Boolean(user));
        return Boolean(user);
      });
  }

  logOut() {
    this.currentUser = undefined;
    return firebase.auth().signOut();
  }

  updatePassword(updatePassword: {new: string, old: string}) {
    return this.login(this.currentUser, updatePassword.old)
      .then(() => firebase.auth().currentUser.updatePassword(updatePassword.new));
  }

  /**
   * Update the user informations
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  updateUserInfo(user: UserModel) {
    let userInfo = {};
    for (let att in user) {
      if (user.hasOwnProperty(att) && user[att] !== Object(user[att])) {
        userInfo[att] = user[att];
      }
    }
    //userInfo.email = user.email;
    //userInfo.name = user.name;
    //userInfo.phoneNumber = user.phoneNumber;
    //userInfo.address = user.address;
    return this.refDatabase.child('users').child(user.uid).update(userInfo)
      .then(() => this.updateUserAuthEmail(user))
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
      return firebase.auth().currentUser.updateEmail(user.email);
    } else {
      return Promise.resolve(user);
    }
  }
}
