import { Component, OnInit } from '@angular/core';
import { MdDialogRef, MdSnackBarConfig } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarParkModel } from '../car-park.model';

@Component({
  selector: 'app-add-car',
  templateUrl: './edit-car-park.dialog.html',
  styleUrls: ['./edit-car-park.dialog.css']
})
export class EditCarParkDialog implements OnInit {

  carParkToEdit: CarParkModel;

  carForm: FormGroup;
  formErrors = {
    licencePlateNumber: '',
    brandModel: '',
    colour: ''
  };
  private snackBarConfig: MdSnackBarConfig;

  constructor(public dialogRef: MdDialogRef<EditCarParkDialog>, private formBuilder: FormBuilder,
              public messageService: ValidationMessageService) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.carParkToEdit = new CarParkModel();
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.carForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carForm, this.formErrors));
    this.messageService.onValueChanged(this.carForm, this.formErrors);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  save() {
    //this.carParkToEdit.licencePlateNumber = this.carForm.value.licencePlateNumber;
    //this.carParkToEdit.brandModel = this.carForm.value.brandModel;
    //this.carParkToEdit.colour = this.carForm.value.colour;
    //this.carParkToEdit.type = this.carForm.value.carType;
    this.dialogRef.close(this.carParkToEdit);
  }

  private buildForm() {
    //this.carForm = this.formBuilder.group({
    //  licencePlateNumber: [this.carParkToEdit.licencePlateNumber,
    //    Validators.compose([Validators.required,
    //      Validators.minLength(this.messageService.minLengthLicencePlateNumber),
    //      Validators.maxLength(this.messageService.maxLengthLicencePlateNumber)])],
    //  brandModel: [this.carParkToEdit.brandModel,
    //    Validators.maxLength(this.messageService.maxLengthBrandModel)],
    //  colour: [this.carParkToEdit.colour,
    //    Validators.maxLength(this.messageService.maxLengthCarColour)],
    //  carType: [this.carParkToEdit.type]
    //});
  }

}
