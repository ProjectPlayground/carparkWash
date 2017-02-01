import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MdSnackBar, MdSnackBarConfig, MdDialogConfig, MdDialog } from '@angular/material';
import * as firebase from 'firebase';
import { UserModel } from '../user/user.model';
import { UserService } from '../user/user-service';
import { ToolbarService } from '../shared/toolbar.service';
import { LoadingService } from '../shared/loading.service';
import { GlobalValidator } from '../shared/validator/global.validator';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { CarModel, CarTypeEnum } from '../car/shared/car.model';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { ProfileEnum } from '../user/profile.enum';
import { ConfirmMessageDialog } from '../confirm-message/confirm-message.dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  userModel = new UserModel();
  carModel = new CarModel();
  carParkModel = new CarParkModel();
  password: string;
  confirmPassword: string;
  isOnLogin = true;
  carTypeEnum = CarTypeEnum;

  private snackBarConfig: MdSnackBarConfig;
  profileTypeEnum = ProfileEnum;
  loginForm: FormGroup;
  loginFormErrors = {
    email: '',
    password: '',
  };
  signUpForm: FormGroup;
  signUpFormErrors = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    address: '',
    phoneNumber: '',
    profile: '',
  };
  carForm: FormGroup;
  carFormErrors = {
    licencePlateNumber: '',
    brandModel: '',
    colour: ''
  };

  constructor(public userService: UserService, public toolbarService: ToolbarService,
              public loadingService: LoadingService, public messageService: ValidationMessageService,
              public router: Router, public snackBar: MdSnackBar, public formBuilder: FormBuilder,
              public dialog: MdDialog) {

    this.userModel = new UserModel();
    this.userModel.profile = ProfileEnum.client;
    this.buildForms();
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.toolbarService.show(false);
  }

  ngOnInit() {
    if (this.router.url.indexOf('disconnect') !== -1) {
      this.userService.logOut();
    } else {
      this.userService.isAuth()
        .then(isAuth => {
          if (isAuth) {
            this.toolbarService.show(true);
            this.router.navigate(['profile']);
          } else {
            this.buildForms();
          }
        });
    }
  }

  ngOnDestroy() {
    GlobalValidator.endSamePassword(this.signUpForm, 'signUp');
  }

  login() {
    if (this.isOnLogin) {
      this.loadingService.show(true);
      this.userService.login(this.userModel, this.password).then(() => {
        this.loadingService.show(false);
        this.router.navigate(['profile']);
        this.toolbarService.show(true);
        this.snackBar.open('Log in Success', '', this.snackBarConfig);
      }).catch(err => {
        this.loadingService.show(false);
        this.snackBar.open(err.message, '', this.snackBarConfig);
      });
    } else {
      this.isOnLogin = true;
    }
  }

  loginFacebook() {
    console.log('loginFacebook');
    this.userService.facebookLogin().then((data) => {
      this.loadingService.show(false);
      this.router.navigate(['profile']);
      this.toolbarService.show(true);
      this.snackBar.open('Log in Success', '', this.snackBarConfig);
    }).catch((err: firebase.FirebaseError) => {
      this.loadingService.show(false);
      console.error(err);
      let errMsg = 'Log in Fail';
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

  signUp() {
    if (this.isOnLogin) {
      this.isOnLogin = false;
    } else {
      this.loadingService.show(true);
      this.userService.create(this.userModel, this.password, true, this.carParkModel, this.carModel)
        .then(() => {
          this.loadingService.show(false);
          this.router.navigate(['profile']);
          this.toolbarService.show(true);
          this.snackBar.open('Sign Up Success', '', this.snackBarConfig);
        })
        .catch((err: firebase.FirebaseError) => {
          this.loadingService.show(false);
          console.error(err);
          let errMsg = 'Sign Up Fail';

          switch (err.code) {
            case 'auth/email-already-in-use-but-not-verified':
              let dialogRef = this.dialog.open(ConfirmMessageDialog, <MdDialogConfig>{disableClose: false});
              dialogRef.componentInstance.title = err.message[0];
              dialogRef.componentInstance.content = err.message[1];
              dialogRef.afterClosed().subscribe((isOk: boolean) => {
                if (isOk) {
                  this.loadingService.show(true);
                  this.userService.sentEmailVerification().then(() => {
                    this.loadingService.show(false);
                    this.snackBar.open('Verification email sent', '', this.snackBarConfig);
                    this.isOnLogin = true;
                  }).catch(err => {
                    this.loadingService.show(false);
                    console.log(err);
                    this.snackBar.open('Error Sending Verification email, please contact admin', '', this.snackBarConfig);
                  });
                }
              });
              break;
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
  }

  resetPassword() {
    this.userService.resetPassword(this.userModel).then(() => {
      this.snackBar.open('Reset password email sent', '', this.snackBarConfig);
    }, (err) => {
      console.error(err);
      this.snackBar.open('Could not reset your password, please contact admin', '', this.snackBarConfig);
    });
  }

  private buildForms() {
    this.buildLoginForm();
    this.buildSignUpForm();
    this.buildCarForm();
  }

  private buildCarForm() {
    this.carForm = this.formBuilder.group({
      licencePlateNumber: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthLicencePlateNumber),
        Validators.maxLength(this.messageService.maxLengthLicencePlateNumber)])],
      brandModel: ['', Validators.maxLength(this.messageService.maxLengthBrandModel)],
      colour: ['', Validators.maxLength(this.messageService.maxLengthCarColour)]
    });
    this.carForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.carForm, this.carFormErrors);
    });
    this.messageService.onValueChanged(this.carForm, this.carFormErrors);
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
      phoneNumber: ['', Validators.pattern(/\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)]
    });
    this.signUpForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    });
    this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    setTimeout(GlobalValidator.samePassword(this.signUpForm, 'signUp'), 2000);
  }

  private buildLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.loginForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.loginForm, this.loginFormErrors);
    });
    this.messageService.onValueChanged(this.loginForm, this.loginFormErrors);
  }
}
