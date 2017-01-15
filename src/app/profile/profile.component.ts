import { Component, OnInit } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig, MdDialog, MdDialogConfig } from '@angular/material';
import { LoadingService } from '../shared/loading.service';
import { ToolbarService } from '../shared/toolbar.service';
import { UserService } from '../user/user-service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GlobalValidator } from '../shared/validator/global.validator';
import { UserModel } from '../user/user.model';
import { ChangePasswordDialog } from './change-pssword/change-password.dialog';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { CarModel } from '../car/car.model';
import { CarService } from '../car/car.service';
import { EditCarDialog } from '../car/edit-car/edit-car.dialog';
import { ProfileTypeEnum } from '../shared/profile-type.enum';
import { EditCarParkDialog } from '../car-park/edit-car-park/edit-car-park.dialog';
import { CarParkService } from '../car-park/car-park.service';
import { CarParkModel } from '../car-park/car-park.model';
import { SelectTypeDialog } from './select-type/select-type.dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: UserModel;
  editMode = false;
  allCarParks: Array<CarParkModel>;

  private snackBarConfig: MdSnackBarConfig;
  profileTypeEnum = ProfileTypeEnum;
  profileForm: FormGroup;
  formErrors = {
    email: '',
    name: '',
    address: '',
    phoneNumber: ''
  };
  configCarousel = {
    slidesPerView: 4,
    spaceBetween: 30,
    //grabCursor: true,
    centeredSlides: false,
    //loop: true,
    // autoplay: 5000,
    // autoplayDisableOnInteraction false,
    paginationClickable: true,
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
  };

  constructor(public dialog: MdDialog, public toolbarService: ToolbarService,
              public loadingService: LoadingService, public userService: UserService,
              public carService: CarService, public carParkService: CarParkService,
              public messageService: ValidationMessageService,
              public snackBar: MdSnackBar, public formBuilder: FormBuilder) {

    this.user = new UserModel();
    this.editMode = false;
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.buildProfileForm(false);
    this.carParkService.getAll()
      .then(allCarParks => this.allCarParks = allCarParks)
      .catch(err => {
        console.error(err);
        this.snackBar.open('Fail to update your profile', '', this.snackBarConfig);
      });
  }

  ngOnInit() {
    this.toolbarService.title('Your profile');

    this.loadingService.show(true);
    this.userService.getCurrent(true).then(user => {
      this.user = user;
      this.updateCarsSliderConfig();
      this.loadingService.show(false);
      if (!this.user.profile) {
        this.dialog.open(SelectTypeDialog, <MdDialogConfig>{
          disableClose: true
        }).afterClosed().subscribe(userProfile => {
          if (userProfile) {
            this.loadingService.show(true);
            this.user.profile = userProfile;
            this.userService.updateUserInfo(this.user).then(() => {
              this.loadingService.show(false);
              this.snackBar.open('Type account has been saved', '', this.snackBarConfig);
            }).catch(err => {
              this.loadingService.show(false);
              console.error(err);
              this.snackBar.open('Fail to update your password', '', this.snackBarConfig);
            });
          }
        });
      }
    }).catch(err => {
      this.loadingService.show(false);
      console.error(err);
      this.snackBar.open('Fail to get your profile data', '', this.snackBarConfig);
    });
  }

  toggleEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.buildProfileForm(!editMode);
  }

  add() {
    if (this.user.profile === ProfileTypeEnum.client) {
      this.addCar();
    } else if (this.user.profile === ProfileTypeEnum.manager) {
      this.addCarPark();
    }
  }

  changePassword() {
    this.dialog.open(ChangePasswordDialog, <MdDialogConfig>{
      disableClose: true
    }).afterClosed().subscribe(newPassword => {
      if (newPassword) {
        this.userService.updatePassword(newPassword)
          .then(() => {
            this.snackBar.open('Password has been successfully updated', '', this.snackBarConfig);
          })
          .catch(err => {
            console.error(err);
            this.snackBar.open('Fail to update your password', '', this.snackBarConfig);
          });
      }
    });
  }

  save() {
    this.user.email = this.profileForm.value.email;
    this.user.name = this.profileForm.value.name;
    this.user.address = this.profileForm.value.address;
    this.user.phoneNumber = this.profileForm.value.phoneNumber;
    this.loadingService.show(true);
    this.userService.updateUserInfo(this.user).then(() => {
      this.editMode = false;
      this.loadingService.show(false);
      this.snackBar.open('Profile has been successfully updated', '', this.snackBarConfig);
    }).catch(err => {
      this.editMode = false;
      this.loadingService.show(false);
      console.error(err);
      this.snackBar.open('Fail to update your profile', '', this.snackBarConfig);
    });
  }

  updateUserFromDatabase() {
    this.userService.getCurrent(false).then(user => {
      this.user = user;
      this.updateCarsSliderConfig();
    });
  }

  updateCarsSliderConfig() {
    let itemsLength = 0;
    if (this.user.profile === ProfileTypeEnum.client && this.user.cars.length <= 4) {
      itemsLength = this.user.cars.length
    } else if (this.user.profile === ProfileTypeEnum.manager && this.user.carParks.length <= 4) {
       itemsLength = this.user.carParks.length
    }
    //FIXME to be continued, problem when 1 item then user add another
    // solution, always swiper or 1, 2, 3 and 4 manually, 5 swiper
    //this.configCarousel.slidesPerView = itemsLength;
  }

  private buildProfileForm(isDisabled: boolean) {
    this.profileForm = this.formBuilder.group({
      email: [{value: this.user.email, disabled: isDisabled},
        Validators.compose([Validators.required,
          GlobalValidator.mailFormat,
          Validators.maxLength(this.messageService.maxLengthEmail)])],
      name: [{value: this.user.name, disabled: isDisabled},
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthName),
          Validators.maxLength(this.messageService.maxLengthName)])],
      address: [{value: this.user.address, disabled: isDisabled},
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthAddress),
          Validators.maxLength(this.messageService.maxLengthAddress)])],
      phoneNumber: [{value: this.user.phoneNumber, disabled: isDisabled},
        Validators.pattern(/\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)
      ],
    });
    this.profileForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.profileForm, this.formErrors));
    this.messageService.onValueChanged(this.profileForm, this.formErrors);
  }

  private addCar() {
    this.dialog.open(EditCarDialog, <MdDialogConfig>{disableClose: true})
      .afterClosed().subscribe((newCar: CarModel) => {
      if (newCar) {
        newCar.userUid = this.user.uid;
        this.loadingService.show(true);
        this.carService.add(this.user, newCar)
          .then(() => {
            this.updateCarsSliderConfig();
            this.loadingService.show(false);
            this.snackBar.open('Add selectedCar success', '', this.snackBarConfig);
          })
          .catch(err => {
            this.loadingService.show(false);
            console.error(err);
            this.snackBar.open('Fail to add selectedCar', '', this.snackBarConfig);
          });
      }
    });
  }

  private addCarPark() {
    this.dialog.open(EditCarParkDialog, <MdDialogConfig>{disableClose: true})
      .afterClosed().subscribe((newCarPark: CarParkModel) => {
      if (newCarPark) {
        newCarPark.userUid = this.user.uid;
        this.loadingService.show(true);
        this.carParkService.add(this.user, newCarPark).then(() => {
          this.updateCarsSliderConfig();
          this.loadingService.show(false);
          this.snackBar.open('Add selectedCar park success', '', this.snackBarConfig);
        }).catch(err => {
          this.loadingService.show(false);
          console.error(err);
          this.snackBar.open('Fail to add selectedCar park', '', this.snackBarConfig);
        });
      }
    });
  }
}
