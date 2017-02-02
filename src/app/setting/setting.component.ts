import { Component } from '@angular/core';
import { MdDialogConfig, MdSnackBarConfig, MdDialog, MdSnackBar } from '@angular/material';
import { UserService } from '../user/user-service';
import { UserModel, ProviderTypeEnum } from '../user/user.model';
import { ChangePasswordDialog } from './change-pssword/change-password.dialog';
import { ToolbarService } from '../shared/toolbar.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent {

  user: UserModel;
  providerTypeEnum = ProviderTypeEnum;

  loading = null;

  private snackBarConfig: MdSnackBarConfig;

  constructor(public userService: UserService, public dialog: MdDialog, public snackBar: MdSnackBar,
              public toolbarService: ToolbarService) {

    toolbarService.title('Setting');
    this.userService.getCurrent().then(user => this.user = user);
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  changePassword() {
    this.dialog.open(ChangePasswordDialog, <MdDialogConfig>{
      disableClose: true
    }).afterClosed().subscribe((updatePassword: {new: string, old: string}) => {
      if (updatePassword) {
        this.loading = true;
        this.userService.updatePassword(updatePassword)
          .then(() => {
            this.loading = false;
            this.snackBar.open('Password has been successfully updated', '', this.snackBarConfig);
          })
          .catch(err => {
            console.error(err);
            this.loading = false;
            this.snackBar.open('Fail to update your password', '', this.snackBarConfig);
          });
      }
    });
  }

}
