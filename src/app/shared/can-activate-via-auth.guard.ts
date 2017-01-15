import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../user/user-service';

@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {

  constructor(public userService: UserService, public router: Router) {
  }

  canActivate() {
    return this.userService.isAuth()
      .then(isAuth => {
        if (isAuth) {
          return true;
        } else {
          this.router.navigate(['login']);
          return false;
        }
      });
  }

}
