import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserModel } from '../user/user.model';
import { SubscriptionModel } from '../shared/subscription/subscription.model';
import { ServiceUtils } from '../shared/service.utils';

@Injectable()
export class HistoryService extends ServiceUtils {

  private userNamesRef: firebase.database.Reference;
  private historySubscriptionRef: firebase.database.Reference;

  constructor() {
    super();
    this.userNamesRef = firebase.database().ref('clientNames');
    this.historySubscriptionRef = firebase.database().ref('historySubscription');
  }

  getClients(): firebase.Promise<Array<UserModel>> {
    return this.userNamesRef.once('value').then(snapshot => {
      let userNames = snapshot.val();
      return Object.keys(userNames ? userNames : {}).map(uid => {
        let user = new UserModel();
        user.uid = uid;
        user.name = userNames[uid];
        return user;
      });
    });
  }

  getHistory(user: UserModel): firebase.Promise<Array<SubscriptionModel>> {
    return this.historySubscriptionRef.child(user.uid).once('value')
      .then(snapshot => this.arrayFromObject(snapshot.val()));
  }

}
