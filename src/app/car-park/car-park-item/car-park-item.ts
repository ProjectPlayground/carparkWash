import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CarParkModel } from '../shared/car-park.model';
import { MdSnackBarConfig, MdSnackBar, MdDialog, MdDialogConfig } from '@angular/material';
import { LoadingService } from '../../shared/loading.service';
import { ConfirmMessageDialog } from '../../confirm-message/confirm-message.dialog';
import { CarParkService } from '../shared/car-park.service';
import { EditCarParkDialog } from '../edit-car-park/edit-car-park.dialog';
import { Router } from '@angular/router';
import { UserService } from '../../user/user-service';
import { UserModel } from '../../user/user.model';
import { SubscriberService } from '../../shared/subscription/subscriber.service';
import { CarService } from '../../car/shared/car.service';
import { ProfileEnum } from '../../user/profile.enum';
import { Region } from "../car-park-filter/region.enum";

@Component({
  selector : 'app-car-park-item',
  templateUrl: './car-park-item.html',
  styleUrls : ['./car-park-item.css']
})
export class CarParkItemComponent implements OnInit {

  currentUser: UserModel;
  isCarParkUnlocked: boolean;
  profileTypeEnum = ProfileEnum;
  @Input() carPark: CarParkModel;
  @Input() isSelected: boolean;
  @Output() removed = new EventEmitter<boolean>();

  private snackBarConfig: MdSnackBarConfig;

  constructor(public carParkService: CarParkService, public userService: UserService,
              public subscriberService: SubscriberService, public carService: CarService,
              public loadingService: LoadingService,
              public router: Router, public snackBar: MdSnackBar, public dialog: MdDialog) {

    this.currentUser = new UserModel();
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 3000;
    this.snackBarConfig.politeness = 'polite';
    this.userService.getCurrent().then(user => this.currentUser = user)
      .catch(err => {
        console.error(err);
        this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
      });
  }

  ngOnInit() {
    if (!this.carPark) {
      this.router.navigate(['']);
    } else {
      this.setIsCarParlUnlocked();
    }
  }

  select() {
    this.carParkService.selectedCarPark = this.carPark;
    this.router.navigate(['car/towash']);
  }

  subscribeWashService() {
    if (this.carService.selectedCar) {
      this.subscriberService.subscribe(this.carPark, this.carService.selectedCar)
        .then(() => {
          this.router.navigate(['profile', 'get']);
          this.snackBar.open(`the car ${this.carService.selectedCar.licencePlateNumber} is subscribed to the car park ${this.carPark.name}`
            , '', this.snackBarConfig)
        })
        .catch(err => {
          console.error(err);
          this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
        });
    } else {
      console.error('Can\'t subscribe to an undefined car');
      this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
    }
  }

  unlock() {
    this.subscriberService.unlock(this.carPark)
      .then(() => {
        this.setIsCarParlUnlocked();
        this.snackBar.open(`the car park ${this.carPark.name} is unlocked`, '', this.snackBarConfig);
      })
      .catch(err => {
        console.error(err);
        this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
      });
  }

  edit() {
    let dialogRef = this.dialog.open(EditCarParkDialog, <MdDialogConfig>{disableClose: true});
    dialogRef.componentInstance.carParkToEdit = this.carPark;
    dialogRef.afterClosed().subscribe((carParkToUpdate: {carpark: CarParkModel, region: Region, area: string}) => {
      if (carParkToUpdate && carParkToUpdate.carpark) {
        this.loadingService.show(true);
        this.carParkService.update(carParkToUpdate.carpark, carParkToUpdate.region, carParkToUpdate.area)
          .then(() => {
            this.carPark = carParkToUpdate.carpark;
            this.loadingService.show(false);
            this.snackBar.open(`The car ${this.carPark.name} was updated successfully`, '', this.snackBarConfig);
          })
          .catch(err => {
            this.loadingService.show(false);
            console.error(err);
            this.snackBar.open(`Fail to update ${this.carPark.name}`, '', this.snackBarConfig);
          });
      }
    });
  }

  remove() {
    let dialogRef = this.dialog.open(ConfirmMessageDialog, <MdDialogConfig>{disableClose: false});
    dialogRef.componentInstance.title = 'CONFIRM DELETION';
    dialogRef.componentInstance.content = `Are you sure you would like to delete ${this.carPark.name} ?`;
    dialogRef.afterClosed().subscribe((isOk: boolean) => {
      if (isOk) {
        this.carParkService.remove(this.carPark).then(data => {
          this.removed.emit(true);
          console.log(data);
          this.snackBar.open(`The carpark ${this.carPark.name} was removed successfully`, '', this.snackBarConfig);
        }).catch(err => {
          console.log(err);
          this.snackBar.open(`Could not remove the carpark ${this.carPark.name}, please contact admin`, '', this.snackBarConfig);
        });
      }
    });
  }

  private setIsCarParlUnlocked() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1);
    this.isCarParkUnlocked = this.carPark.unlocked === today.getTime();
  }

}
