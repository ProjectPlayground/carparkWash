import { Component } from '@angular/core';
import { UserModel } from './user/user.model';
import { FirebaseService } from './shared/firebase-service';
import { UserService } from './user/user-service';
import { ToolbarService } from './shared/toolbar.service';
import { UserReady } from './user/user-notifier';
import { LoadingService } from './shared/loading.service';
import { ProfileTypeEnum } from './shared/profile-type.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  currentUser: UserModel;
  showToolbar = true;
  isLoading = false;
  toolbarTitle = 'Carpark';
  profileTypeEnum = ProfileTypeEnum;

  constructor(public firebaseService: FirebaseService, public userService: UserService,
              public userReady: UserReady, public toolbarService: ToolbarService,
              public loadingService: LoadingService) {

  }

  ngOnInit(): void {
    this.toolbarService.showSource$.subscribe(show => this.showToolbar = show);
    this.toolbarService.titleSource$.subscribe(title => this.toolbarTitle = title);
    this.loadingService.showSource$.subscribe(show => this.isLoading = show);
    this.userReady.notifySource$.subscribe(ready => {
      if (ready) {
        this.userService.getCurrent()
          .then(currentUser => this.currentUser = currentUser)
      }
    });
  }
}
