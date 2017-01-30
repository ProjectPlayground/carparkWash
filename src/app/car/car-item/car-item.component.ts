import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig, MdDialog, MdDialogConfig } from '@angular/material';
import { CarModel } from '../shared/car.model';
import { CarService } from '../shared/car.service';
import { LoadingService } from '../../shared/loading.service';
import { EditCarDialog } from '../edit-car/edit-car.dialog';
import { ConfirmMessageDialog } from '../../confirm-message/confirm-message.dialog';
import { Router } from '@angular/router';
import { UserService } from '../../user/user-service';
import { UserModel } from '../../user/user.model';
import { ProfileEnum } from '../../user/profile.enum';
import { SubscriberService } from '../../shared/subscription/subscriber.service';
import { SubscriptionModel } from '../../shared/subscription/subscription.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { WashStateEnum } from '../../shared/subscription/wash-state.enum';
import { CarLotNumberDialog } from "../car-lot-number/car-lot-number.dialog";

@Component({
  selector: 'app-car-item',
  templateUrl: './car-item.component.html',
  styleUrls: ['./car-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarItemComponent implements OnInit {

  currentUser: UserModel;
  carParkSubscribed: CarParkModel;
  carParkSubscribedIsUnlocked: boolean;
  dayIndex: number;
  profileEnum = ProfileEnum;
  washStateEnum = WashStateEnum;
  @Input() car: CarModel;
  @Input() subscription: SubscriptionModel;
  @Input() isSelected: boolean;
  @Output() removed = new EventEmitter<boolean>();

  private snackBarConfig: MdSnackBarConfig;

  constructor(public carService: CarService, public userService: UserService, public carParkService: CarParkService,
              public subscriberService: SubscriberService, public loadingService: LoadingService,
              public router: Router, public snackBar: MdSnackBar, public dialog: MdDialog) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.currentUser = this.userService.getIfSet();
    if (!this.currentUser) {
      this.userService.getCurrent()
        .then(user => {
          this.currentUser = user;
        })
        .catch(err => {
          console.error(err);
          this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
        });
    }
  }

  ngOnInit() {
    if (!this.car && !this.subscription) {
      this.router.navigate(['']);
    } else {
      if (this.subscription) {
        this.car = this.subscription.car;
        this.carParkService.getBySubscription(this.subscription).then(carPark => {
            this.carParkSubscribed = carPark;
            this.setIsSubscribedCarParkUnlocked();
          });
      } else if (this.car.subscription) {
        this.subscription = this.car.subscription;
        this.carParkService.getBySubscription(this.car.subscription).then(carPark => {
            this.carParkSubscribed = carPark;
            this.setIsSubscribedCarParkUnlocked();
          });
      }
      if (this.subscription) {
        this.dayIndex = Math.round((new Date().getTime() - this.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
      }
    }
  }

  selectToSubscribe() {
    this.carService.selectedCar = this.car;
    this.router.navigate(['carparks/tobook']);
  }

  selectToWash() {
    let dialogRef = this.dialog.open(CarLotNumberDialog, <MdDialogConfig>{disableClose: false});
    dialogRef.afterClosed().subscribe((carLotNumber: string) => {
      if (carLotNumber) {
        // car lot number is a number
        if (carLotNumber.length > 0) {
          this.subscriberService.selectToBeWashed(this.subscription, carLotNumber)
            .then(() => this.snackBar.open(`The car ${this.car.licencePlateNumber} is to be washed`, '', this.snackBarConfig))
            .catch(err => {
              console.error(err);
              this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
            });
        } else {
          this.snackBar.open('Car Lot Number cannot be empty', '', this.snackBarConfig);
          this.selectToWash();
        }
      }
    });
  }

  selectAsWashed() {
    this.subscriberService.setToWashed(this.subscription, this.currentUser)
      .then(() => this.snackBar.open('The selected car is washed', '', this.snackBarConfig))
      .catch(err => {
        console.error(err);
        this.snackBar.open('Fatal Error, please contact admin', '', this.snackBarConfig);
      });
  }

  edit() {
    let dialogRef = this.dialog.open(EditCarDialog, <MdDialogConfig>{disableClose: true});
    dialogRef.componentInstance.carToEdit = this.car;
    dialogRef.afterClosed().subscribe((updatedCar: CarModel) => {
      if (updatedCar) {
        this.loadingService.show(true);
        this.carService.update(updatedCar)
          .then(() => {
            this.car = updatedCar;
            this.loadingService.show(false);
            this.snackBar.open(`The car ${this.car.licencePlateNumber} was updated successfully`, '', this.snackBarConfig);
          })
          .catch(err => {
            this.loadingService.show(false);
            console.error(err);
            this.snackBar.open(`Fail to update ${this.car.licencePlateNumber}`, '', this.snackBarConfig);
          });
      }
    });
  }

  remove() {
    let dialogRef = this.dialog.open(ConfirmMessageDialog, <MdDialogConfig>{disableClose: false});
    dialogRef.componentInstance.title = 'CONFIRM DELETION';
    dialogRef.componentInstance.content = `Are you sure you would like to delete ${this.car.licencePlateNumber} ?`;
    dialogRef.afterClosed().subscribe((isOk: boolean) => {
      if (isOk) {
        this.carService.remove(this.car)
          .then(data => {
            this.removed.emit(true);
            console.log(data);
            this.snackBar.open(`The car ${this.car.licencePlateNumber} was removed successfully`, '', this.snackBarConfig);
          })
          .catch(err => {
            console.log(err);
            this.snackBar.open(`Could not remove the car ${this.car.licencePlateNumber}, please contact admin`, '', this.snackBarConfig);
          });
      }
    });
  }

  private setIsSubscribedCarParkUnlocked() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1);
    this.carParkSubscribedIsUnlocked = this.carParkSubscribed && this.carParkSubscribed.unlocked === today.getTime();
  }
}
