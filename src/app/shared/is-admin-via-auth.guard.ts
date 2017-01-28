import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../user/user-service';
import { ProfileEnum } from '../user/profile.enum';

@Injectable()
export class IsAdminViaAuthGuard implements CanActivate {

  constructor(public userService: UserService, public router: Router) {
  }

  canActivate() {
    return this.userService.isAuth()
      .then(isAuth => {
        if (isAuth) {
          return this.userService.getCurrent()
            .then(user => {
              let isAdmin = user.profile === ProfileEnum.admin;
              if (!isAdmin) {
                this.router.navigate(['profile']);
              }
              return isAdmin;
            })
            .catch(() => {
              this.router.navigate(['profile']);
              return false;
            });
        } else {
          this.router.navigate(['login']);
          return false;
        }
      });
  }

}
