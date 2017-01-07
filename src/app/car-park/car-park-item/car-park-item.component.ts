import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CarParkModel } from '../car-park.model';
import { MdSnackBarConfig, MdSnackBar, MdDialog, MdDialogConfig } from '@angular/material';
import { LoadingService } from '../../shared/loading.service';
import { ConfirmMessageDialog } from '../../confirm-message/confirm-message.dialog';
import { CarParkService } from '../car-park.service';
import { EditCarParkDialog } from '../edit-car-park/edit-car-park.dialog';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user/user-service';
import { UserModel } from '../../shared/user/user.model';
import { SubscriberService } from '../../shared/subscription/subscriber.service';
import { CarService } from '../../car/car.service';
import { ProfileTypesEnum } from '../../shared/profile-types.enum';

@Component({
  selector: 'app-car-park-item',
  templateUrl: './car-park-item.component.html',
  styleUrls: ['./car-park-item.component.css']
})
export class CarParkItemComponent implements OnInit {

  currentUser: UserModel;
  profileTypesEnum = ProfileTypesEnum;
  @Input() carPark: CarParkModel;
  @Output() removed = new EventEmitter<boolean>();

  private snackBarConfig: MdSnackBarConfig;

  constructor(public carParkService: CarParkService, public userService: UserService,
              public subscriberService: SubscriberService, public carService: CarService,
              public loadingService: LoadingService,
              public router: Router, public snackBar: MdSnackBar, public dialog: MdDialog) {

    this.currentUser = new UserModel();
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
    if (!this.carPark) {
      this.router.navigate(['']);
    }
  }

  select() {
    this.carParkService.selectedCarPark = this.carPark;
    this.router.navigate(['car/towash']);
  }

  subscribeWashService() {
    if (this.carService.selectedCar) {
    this.subscriberService.subscribe(this.carPark, this.carService.selectedCar)
      .then(() => this.snackBar.open(`the selected car is subscribed to the carpark ${this.carPark.name}`
        , '', this.snackBarConfig))
      .catch();
    } else {
      this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
    }
  }

  edit() {
    let dialogRef = this.dialog.open(EditCarParkDialog, <MdDialogConfig>{disableClose: true});
    dialogRef.componentInstance.carParkToEdit = this.carPark;
    dialogRef.afterClosed().subscribe((updatedCarPark: CarParkModel) => {
      if (updatedCarPark) {
        this.loadingService.show(true);
        this.carParkService.update(updatedCarPark)
          .then(() => {
            this.carPark = updatedCarPark;
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
  }

  remove() {
    let dialogRef = this.dialog.open(ConfirmMessageDialog, <MdDialogConfig>{disableClose: false});
    dialogRef.componentInstance.title = 'Confirmation of deletion';
    dialogRef.componentInstance.content = 'Are you sure to remove this selectedCar ?';
    dialogRef.afterClosed().subscribe((isOk: boolean) => {
      if (isOk) {
        this.carParkService.remove(this.carPark)
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
  }

}
