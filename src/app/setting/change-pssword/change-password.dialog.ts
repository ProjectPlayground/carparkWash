import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MdDialogRef } from '@angular/material';
import { GlobalValidator } from '../../shared/validator/global.validator';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.dialog.html',
  styleUrls: ['./change-password.dialog.css']
})
export class ChangePasswordDialog implements OnInit, OnDestroy {

  passwordForm: FormGroup;
  oldPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  formErrors = {
    'oldPassword': '',
    'newPassword': '',
    'confirmPassword': ''
  };

  constructor(public messageService: ValidationMessageService, public dialogRef: MdDialogRef<ChangePasswordDialog>,
              public formBuilder: FormBuilder) {

    this.passwordForm = formBuilder.group({
      oldPassword: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      newPassword: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      confirmPassword: ['', Validators.required]
    });
    this.passwordForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.passwordForm, this.formErrors));
    this.messageService.onValueChanged(this.passwordForm, this.formErrors);
  }

  ngOnInit() {
    GlobalValidator.samePassword(this.passwordForm, 'changePassword', 'newPassword', 'confirmPassword');
  }

  ngOnDestroy() {
    GlobalValidator.endSamePassword(this.passwordForm, 'changePassword');
  }

  cancel() {
    this.dialogRef.close(false);
  }

  save() {
    this.dialogRef.close({new: this.newPassword, old: this.oldPassword});
  }

}
