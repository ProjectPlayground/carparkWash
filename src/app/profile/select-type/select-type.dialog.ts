import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MdDialogRef } from '@angular/material';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { ProfileType, ProfileTypeEnum } from '../../shared/profile-type.enum';

@Component({
  selector: 'app-select-type',
  templateUrl: './select-type.dialog.html',
  styleUrls: ['./select-type.dialog.css']
})
export class SelectTypeDialog {

  profile: ProfileType;

  profileTypeEnum = ProfileTypeEnum;
  selectTypeForm: FormGroup;
  formErrors = {
    'profile': '',
  };

  constructor(public messageService: ValidationMessageService, public dialogRef: MdDialogRef<SelectTypeDialog>,
              public formBuilder: FormBuilder) {

    this.selectTypeForm = formBuilder.group({
      profile: ['', Validators.required]
    });
    this.selectTypeForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.selectTypeForm, this.formErrors));
    this.messageService.onValueChanged(this.selectTypeForm, this.formErrors);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  save() {
    this.dialogRef.close(this.profile);
  }

}
