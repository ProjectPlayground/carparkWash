import { Component } from '@angular/core';
import { UserModel } from './user.model';
import { MdSnackBarConfig, MdSnackBar } from '@angular/material';
import { ProfileTypeEnum } from '../shared/profile-type.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from './user-service';
import { ToolbarService } from '../shared/toolbar.service';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { LoadingService } from '../shared/loading.service';
import { Router } from '@angular/router';
import { GlobalValidator } from '../shared/validator/global.validator';
import { CarParkModel } from '../car-park/car-park.model';
import { CardinalPartEnum } from '../car-park/car-park-filter/cardinal-part-enum';
import { PickImageAbstract } from '../shared/PickImageAbstract';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent extends PickImageAbstract {

  connectEmailNoFacebook: 'true' | 'false';
  userModel = new UserModel();
  carParkModel = new CarParkModel();
  password: string;
  confirmPassword: string;
  isPictureLoading = false;

  private snackBarConfig: MdSnackBarConfig;
  profileTypeEnum = ProfileTypeEnum;
  cardinalPartEnum= CardinalPartEnum;
  signUpForm: FormGroup;
  signUpFormErrors = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    address: '',
    phoneNumber: '',
  };
  carParkForm: FormGroup;
  carParkFormErrors = {
    name: '',
    address: '',
    cardinalPart: '',
    area: '',
    //nbPlaces: ''
  };
  cleanerForm: FormGroup;
  cleanerFormErrors = {};

  constructor(public userService: UserService, public toolbarService: ToolbarService,
              public loadingService: LoadingService, public messageService: ValidationMessageService,
              public router: Router, public snackBar: MdSnackBar, public formBuilder: FormBuilder) {

    super();
    this.userModel = new UserModel();
    this.buildForms();
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.toolbarService.title('Create Manager/Cleaner account');
  }

  ngOnInit() {
    this.buildForms();
  }

  ngOnDestroy() {
    GlobalValidator.endSamePassword(this.signUpForm, 'signUp');
  }

  createAccount() {
    if(this.connectEmailNoFacebook === 'true') {
      this.createWithEmail();
    } else {
      this.createWithFacebook();
    }
  }

  pickCarParkPicture(event) {
    this.isPictureLoading = true;
    this.loadImage(event).then((res: any) => {
      this.isPictureLoading = false;
      this.carParkModel.picture = res.target.result;
    }).catch(err => {
      console.log(err);
      this.isPictureLoading = false;
      this.snackBar.open('Fail to get background', '', this.snackBarConfig);
    });
  }

  private createWithFacebook() {
    this.loadingService.show(true);
    this.userService.facebookLogin(this.userModel, this.carParkModel).then((data) => {
      this.loadingService.show(false);
      this.buildForms();
      this.snackBar.open(`Account ${this.userModel.profile} created`, '', this.snackBarConfig);
    }).catch((err: firebase.FirebaseError) => {
      this.loadingService.show(false);
      console.error(err);
      let errMsg = 'Fail to create ${this.userModel.profile}  account';
      switch (err.code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errMsg = 'Incorrect email or password';
          break;
      }
      this.snackBar.open(errMsg, '', this.snackBarConfig);
    });
  }

  private createWithEmail() {
    this.loadingService.show(true);
    this.userService.create(this.userModel, this.password, this.carParkModel)
      .then(() => {
        this.loadingService.show(false);
        this.buildForms();
        this.snackBar.open(`Account ${this.userModel.profile} created`, '', this.snackBarConfig);
      })
      .catch((err: firebase.FirebaseError) => {
        this.loadingService.show(false);
        console.error(err);
        let errMsg = 'Fail to create ${this.userModel.profile}  account';
        switch (err.code) {
          case 'auth/email-already-in-use':
            errMsg = err.message;
            break;
          case 'auth/network-request-failed':
            errMsg = 'No internet connection';
            break;
        }
        this.snackBar.open(errMsg, '', this.snackBarConfig);
      });
  }

  private buildForms() {
    this.buildSignUpForm();
    this.buildCarParkForm();
    this.buildCleanerForm();
  }

  private buildCarParkForm() {
    this.carParkForm = this.formBuilder.group({
      carParkName: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthCarParkName),
        Validators.maxLength(this.messageService.maxLengthCarParkName)])],
      address: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthAddress),
        Validators.maxLength(this.messageService.maxLengthAddress)])],
      cardinalPart: ['', Validators.required],
      area: ['', Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthName),
          Validators.maxLength(this.messageService.maxLengthName)])],
      //nbPlaces: ['', Validators.pattern('^[0-9]+$')]
    });
    this.carParkForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.carParkForm, this.carParkFormErrors);
    });
    this.messageService.onValueChanged(this.carParkForm, this.carParkFormErrors);
  }

  private buildSignUpForm() {
    this.signUpForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required,
        GlobalValidator.mailFormat,
        Validators.maxLength(this.messageService.maxLengthEmail)])],
      name: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthName),
        Validators.maxLength(this.messageService.maxLengthName)])],
      password: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      confirmPassword: ['', Validators.required],
      address: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthAddress),
        Validators.maxLength(this.messageService.maxLengthAddress)])],
      phoneNumber: ['', Validators.pattern(/\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)],
      profile: ['', Validators.required]
    });
    this.signUpForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    });
    this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    setTimeout(GlobalValidator.samePassword(this.signUpForm, 'signUp'), 2000);
  }

  private buildCleanerForm() {
    this.cleanerForm = this.formBuilder.group({
      //email: ['', Validators.required],
      //password: ['', Validators.required]
    });
    this.cleanerForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.cleanerForm, this.cleanerFormErrors);
    });
    this.messageService.onValueChanged(this.cleanerForm, this.cleanerFormErrors);
  }
}
