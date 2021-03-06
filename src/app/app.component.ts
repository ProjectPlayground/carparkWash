import { Component } from '@angular/core';
import { UserModel } from './user/user.model';
import { FirebaseService } from './shared/firebase-service';
import { UserService } from './user/user-service';
import { ToolbarService } from './shared/toolbar.service';
import { UserReady } from './user/user-notifier';
import { ProfileEnum } from './user/profile.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  currentUser: UserModel;
  showToolbar = true;
  toolbarTitle = 'Car Park';
  profileTypeEnum = ProfileEnum;

  constructor(public firebaseService: FirebaseService, public userService: UserService,
              public userReady: UserReady, public toolbarService: ToolbarService) {

  }

  ngOnInit(): void {
    this.toolbarService.showSource$.subscribe(show => this.showToolbar = show);
    this.toolbarService.titleSource$.subscribe(title => this.toolbarTitle = title);

    this.userReady.notifySource$.subscribe(ready => {
      if (ready) {
        this.userService.getCurrent()
          .then(currentUser => this.currentUser = currentUser)
      }
    });
  }

  openCarparkInfo() {
    window.open('https://services2.hdb.gov.sg/webapp/BN22CpkVcncy/BN22CpkInfoSearch.jsp');
  }
}
