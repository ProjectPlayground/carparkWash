import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MdSnackBarConfig, MdSnackBar } from '@angular/material';
import { UserModel } from './user.model';
import { ProfileEnum } from './profile.enum';
import { UserService } from './user-service';
import { ToolbarService } from '../shared/toolbar.service';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { GlobalValidator } from '../shared/validator/global.validator';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { RegionEnum } from '../car-park/car-park-filter/region.enum';
import { PickImageAbstract } from '../shared/PickImageAbstract';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUserComponent extends PickImageAbstract implements OnInit, OnDestroy {

  connectEmailNoFacebook: 'true' | 'false';
  userModel = new UserModel();
  carParkModel = new CarParkModel();
  password: string;
  confirmPassword: string;

  loading = null;
  isPictureLoading = false;

  private snackBarConfig: MdSnackBarConfig;
  profileEnum = ProfileEnum;
  regionEnum = RegionEnum;
  signUpForm: FormGroup;
  signUpFormErrors = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  };
  userInfoForm: FormGroup;
  userInfoFormErrors = {
    address: '',
    phoneNumber: '',
  };
  carParkForm: FormGroup;
  carParkFormErrors = {
    name: '',
    code: '',
    address: '',
    area: '',
    //nbPlaces: ''
  };
  cleanerForm: FormGroup;
  cleanerFormErrors = {};

  constructor(public userService: UserService, public toolbarService: ToolbarService,
              public messageService: ValidationMessageService, public router: Router,
              public snackBar: MdSnackBar, public formBuilder: FormBuilder) {

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
    if (this.connectEmailNoFacebook === 'true') {
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
      this.snackBar.open('Fail to get Picture', '', this.snackBarConfig);
    });
  }

  areInputsValid() {
    return this.userInfoForm.valid
      && ((this.connectEmailNoFacebook === 'true' && this.signUpForm.valid) || this.connectEmailNoFacebook === 'false')
      && ((this.userModel.profile === ProfileEnum.cleaner && this.cleanerForm.valid)
      || (this.userModel.profile === ProfileEnum.manager && this.carParkForm.valid))
  }

  private createWithFacebook() {
    this.loading = true;
    this.userService.facebookLogin(this.userModel, this.carParkModel).then((data) => {
      this.loading = false;
      this.buildForms();
      this.snackBar.open(`Account ${this.userModel.email} created`, '', this.snackBarConfig);
    }).catch((err: firebase.FirebaseError) => {
      this.loading = false;
      console.error(err);
      let errMsg = `Fail to create ${this.userModel.email}  account`;
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
    this.loading = true;
    this.userService.create(this.userModel, this.password, false, this.carParkModel)
      .then(() => {
        this.loading = false;
        this.buildForms();
        this.snackBar.open(`Account ${this.userModel.email} created`, '', this.snackBarConfig);
      })
      .catch((err: firebase.FirebaseError) => {
        this.loading = false;
        console.error(err);
        let errMsg = `Fail to create ${this.userModel.email}  account`;
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
    this.carParkModel.picture = '';
    this.buildSignUpForm();
    this.buildUserInfoForm();
    this.buildCarParkForm();
    this.buildCleanerForm();
  }

  private buildCarParkForm() {
    this.carParkForm = this.formBuilder.group({
      carParkName: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthCarParkName),
        Validators.maxLength(this.messageService.maxLengthCarParkName)])],
      carParkCode: ['', Validators.compose([Validators.required,
        Validators.maxLength(this.messageService.maxLengthCarParkCode)])],
      address: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthAddress),
        Validators.maxLength(this.messageService.maxLengthAddress)])],
      region: ['', Validators.required],
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
        GlobalValidator.mailFormat, Validators.maxLength(
          this.messageService.maxLengthEmail)])],
      name: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthName),
        Validators.maxLength(this.messageService.maxLengthName)])],
      password: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      confirmPassword: ['', Validators.required],
    });
    this.signUpForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    });
    this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    setTimeout(GlobalValidator.samePassword(this.signUpForm, 'signUp'), 2000);
  }

  private buildUserInfoForm() {
    this.userInfoForm = this.formBuilder.group({
      address: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthAddress),
        Validators.maxLength(this.messageService.maxLengthAddress)])],
      phoneNumber: ['', Validators.pattern(/\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)],
      profile: ['', Validators.required]
    });
    this.userInfoForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.userInfoForm, this.userInfoFormErrors);
    });
    this.messageService.onValueChanged(this.userInfoForm, this.userInfoFormErrors);
  }

  private buildCleanerForm() {
    this.cleanerForm = this.formBuilder.group(
      {
        //email: ['', Validators.required],
        //password: ['', Validators.required]
      });
    this.cleanerForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.cleanerForm, this.cleanerFormErrors);
    });
    this.messageService.onValueChanged(this.cleanerForm, this.cleanerFormErrors);
  }

}
