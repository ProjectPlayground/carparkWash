import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig, MdDialog, MdDialogConfig } from '@angular/material';
import { CarModel } from '../car.model';
import { CarService } from '../car.service';
import { LoadingService } from '../../shared/loading.service';
import { EditCarDialog } from '../edit-car/edit-car.dialog';
import { ConfirmMessageDialog } from '../../confirm-message/confirm-message.dialog';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user/user-service';
import { UserModel } from '../../shared/user/user.model';
import { ProfileTypesEnum } from '../../shared/profile-types.enum';
import { SubscriberService } from '../../shared/subscription/subscriber.service';
import { SubscriptionModel } from '../../shared/subscription/subscription.model';

@Component({
  selector: 'app-car-item',
  templateUrl: './car-item.component.html',
  styleUrls: ['./car-item.component.css']
})
export class CarItemComponent implements OnInit {

  currentUser: UserModel;
  profileTypesEnum = ProfileTypesEnum;
  @Input() car: CarModel;
  @Input() subscription: SubscriptionModel;
  @Output() removed = new EventEmitter<boolean>();

  private snackBarConfig: MdSnackBarConfig;

  constructor(public carService: CarService, public userService: UserService,
              public subscriberService: SubscriberService, public loadingService: LoadingService,
              public router: Router, public snackBar: MdSnackBar, public dialog: MdDialog) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.userService.getCurrent()
      .then(user => this.currentUser = user)
      .catch(err => {
        console.error(err);
        this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
      });
  }

  ngOnInit() {
    if (!this.car && !this.subscription) {
      this.router.navigate(['']);
    }
    if(this.subscription) {
      this.car = this.subscription.car;
    }
  }

  selectToSubscribe() {
    this.carService.selectedCar = this.car;
    this.router.navigate(['carparks/tobook']);
  }

  selectAsWashed() {
    this.subscriberService.setToWashed(this.subscription, this.currentUser)
      .then(() => this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig))
      .catch(err => {
        console.error(err);
        this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
      });
  }

  edit(event: Event) {
    let dialogRef = this.dialog.open(EditCarDialog, <MdDialogConfig>{disableClose: true});
    dialogRef.componentInstance.carToEdit = this.car;
    dialogRef.afterClosed().subscribe((updatedCar: CarModel) => {
      if (updatedCar) {
        this.loadingService.show(true);
        this.carService.update(updatedCar)
          .then(() => {
            this.car = updatedCar;
            this.loadingService.show(false);
            this.snackBar.open('Updating selectedCar success', '', this.snackBarConfig);
          })
          .catch(err => {
            this.loadingService.show(false);
            console.error(err);
            this.snackBar.open('Fail to update selectedCar', '', this.snackBarConfig);
          });
      }
    });
    event.stopPropagation();
  }

  remove(event) {
    let dialogRef = this.dialog.open(ConfirmMessageDialog, <MdDialogConfig>{disableClose: false});
    dialogRef.componentInstance.title = 'Confirmation of deletion';
    dialogRef.componentInstance.content = 'Are you sure to remove this selectedCar ?';
    dialogRef.afterClosed().subscribe((isOk: boolean) => {
      if (isOk) {
        this.carService.remove(this.car)
          .then(data => {
            this.removed.emit(true);
            console.log(data);
            this.snackBar.open('Your selectedCar was removed successfully', '', this.snackBarConfig);
          })
          .catch(err => {
            console.log(err);
            this.snackBar.open('Could not remove your selectedCar, please contact admin', '', this.snackBarConfig);
          });
      }
    });
    event.stopPropagation();
  }

}
