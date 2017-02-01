import { Component, OnInit } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig, MdDialog, MdDialogConfig } from '@angular/material';
import { LoadingService } from '../shared/loading.service';
import { ToolbarService } from '../shared/toolbar.service';
import { UserService } from '../user/user-service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GlobalValidator } from '../shared/validator/global.validator';
import { UserModel } from '../user/user.model';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { CarModel } from '../car/shared/car.model';
import { CarService } from '../car/shared/car.service';
import { EditCarDialog } from '../car/edit-car/edit-car.dialog';
import { ProfileEnum } from '../user/profile.enum';
import { EditCarParkDialog } from '../car-park/edit-car-park/edit-car-park.dialog';
import { CarParkService } from '../car-park/shared/car-park.service';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { SelectTypeDialog } from './select-type/select-type.dialog';
import { CarParkFilterModel } from '../car-park/car-park-filter/car-park-filter.model';
import { Region } from "../car-park/car-park-filter/region.enum";
import { AnnouncementService } from "../shared/announcement.service";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: UserModel;
  editMode = false;
  carParks: Array<CarParkModel>;
  announcement: string;

  announcementForm: FormGroup;
  announcementFormErrors = {
    announcement: '',
  };

  private snackBarConfig: MdSnackBarConfig;
  profileTypeEnum = ProfileEnum;
  profileForm: FormGroup;
  profileFormErrors = {
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
              public snackBar: MdSnackBar, public formBuilder: FormBuilder,
              public announcementService: AnnouncementService, public route: Router, public routeA: ActivatedRoute) {

    this.user = new UserModel();
    this.editMode = false;
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.buildProfileForm(false);
    this.carParkService.getAll()
      .then(allCarParks => this.carParks = allCarParks)
      .catch(err => {
        console.error(err);
        this.snackBar.open('Fail to load car parks', '', this.snackBarConfig);
      });
  }

  ngOnInit() {
    this.toolbarService.title('Your profile');

    this.loadingService.show(true);

    let fromCache = true;
    if (this.route.url.indexOf('get')) {
      fromCache = false;
    }
    this.userService.getCurrent(fromCache).then(user => {
      this.user = user;
      this.loadingService.show(false);
    }).catch(err => {
      this.loadingService.show(false);
      console.error(err);
      this.snackBar.open('Fail to get your profile data', '', this.snackBarConfig);
    });

    this.loadingService.show(true);
    this.announcementService.get().then(announcement => {
      this.announcement = announcement;
      this.buildAnnouncementForm();
      console.log(announcement);
      this.loadingService.show(false);
    }).catch(err => {
      this.loadingService.show(false);
      console.error(err);
      this.snackBar.open('Fail to get announcement, Please contact admin', '', this.snackBarConfig);
    });
  }

  resetAnnouncement() {
    this.buildAnnouncementForm();
  }

  saveAnnouncement() {
    this.announcementService.set(this.announcementForm.value.announcement)
      .then(() => {
        this.announcement = this.announcementForm.value.announcement;
        this.snackBar.open('Announcement saved', '', this.snackBarConfig);
      })
      .catch(err => {
        console.log(err);
        this.snackBar.open(err.message, '', this.snackBarConfig);
      });
  }

  getCarParksFilter(carParkFilterModel: CarParkFilterModel) {
    this.loadingService.show(true);
    this.carParkService.getFiltered(carParkFilterModel)
      .then(carParks => {
        this.carParks = carParks;
        this.loadingService.show(false);
      })
      .catch(err => {
        console.log(err);
        this.loadingService.show(false);
        this.snackBar.open('Error getting Car parks, please contact admin', '', this.snackBarConfig);
      });
  }

  toggleEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.buildProfileForm(!editMode);
  }

  add() {
    if (this.user.profile === ProfileEnum.client) {
      this.addCar();
    } else if (this.user.profile === ProfileEnum.manager) {
      this.addCarPark();
    }
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
    this.userService.getCurrent(false).then(user => this.user = user);
  }

  private buildAnnouncementForm() {
    this.announcementForm = this.formBuilder.group({
      announcement: [this.announcement],
    });
    this.announcementForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.announcementForm, this.announcementFormErrors);
    });
    this.messageService.onValueChanged(this.announcementForm, this.announcementFormErrors);
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
      .subscribe(data => this.messageService.onValueChanged(this.profileForm, this.profileFormErrors));
    this.messageService.onValueChanged(this.profileForm, this.profileFormErrors);
  }

  private addCar() {
    this.dialog.open(EditCarDialog, <MdDialogConfig>{disableClose: true})
      .afterClosed().subscribe((newCar: CarModel) => {
      if (newCar) {
        newCar.userUid = this.user.uid;
        this.loadingService.show(true);
        this.carService.add(this.user, newCar).then(() => {
          this.loadingService.show(false);
          this.snackBar.open(`The car ${newCar.licencePlateNumber} added successfully`, '', this.snackBarConfig);
        }).catch(err => {
          this.loadingService.show(false);
          console.error(err);
          this.snackBar.open(`Fail to add ${newCar.licencePlateNumber}`, '', this.snackBarConfig);
        });
      }
    });
  }

  private addCarPark() {
    this.dialog.open(EditCarParkDialog, <MdDialogConfig>{disableClose: true})
      .afterClosed().subscribe((newCarPark: {carpark: CarParkModel, region: Region, area: string}) => {
      if (newCarPark && newCarPark.carpark) {
        newCarPark.carpark.userUid = this.user.uid;
        newCarPark.carpark.region = newCarPark.region;
        newCarPark.carpark.area = newCarPark.area;
        this.loadingService.show(true);
        this.carParkService.add(this.user, newCarPark.carpark).then(() => {
          this.loadingService.show(false);
          this.snackBar.open(`The car ${newCarPark.carpark.name} added successfully`, '', this.snackBarConfig);
        }).catch(err => {
          this.loadingService.show(false);
          console.error(err);
          this.snackBar.open(`Fail to add ${newCarPark.carpark.name}`, '', this.snackBarConfig);
        });
      }
    });
  }
}
