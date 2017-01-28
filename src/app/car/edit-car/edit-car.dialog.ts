import { Component, OnInit } from '@angular/core';
import { MdDialogRef, MdSnackBarConfig } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarModel, SilhouettePictureTypeEnum } from '../shared/car.model';

@Component({
  selector: 'app-add-car',
  templateUrl: './edit-car.dialog.html',
  styleUrls: ['./edit-car.dialog.css']
})
export class EditCarDialog implements OnInit {

  carToEdit: CarModel;

  silhouettePictureTypeEnum = SilhouettePictureTypeEnum;
  private snackBarConfig: MdSnackBarConfig;
  carForm: FormGroup;
  formErrors = {
    licencePlateNumber: '',
    brandModel: '',
    colour: ''
  };

  constructor(public dialogRef: MdDialogRef<EditCarDialog>, private formBuilder: FormBuilder,
              public messageService: ValidationMessageService) {

    this.carToEdit = new CarModel();
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }

  cancel() {
    this.dialogRef.close(false);
  }

  save() {
    this.carToEdit.licencePlateNumber = this.carForm.value.licencePlateNumber;
    this.carToEdit.brandModel = this.carForm.value.brandModel;
    this.carToEdit.colour = this.carForm.value.colour;
    this.carToEdit.silhouettePicture = this.carForm.value.silhouettePicture;
    this.dialogRef.close(this.carToEdit);
  }

  private buildForm() {
    this.carForm = this.formBuilder.group({
      licencePlateNumber: [this.carToEdit.licencePlateNumber,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthLicencePlateNumber),
          Validators.maxLength(this.messageService.maxLengthLicencePlateNumber)])],
      brandModel: [this.carToEdit.brandModel,
        Validators.maxLength(this.messageService.maxLengthBrandModel)],
      colour: [this.carToEdit.colour,
        Validators.maxLength(this.messageService.maxLengthCarColour)],
      silhouettePicture: [this.carToEdit.silhouettePicture]
    });
    this.carForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carForm, this.formErrors));
    this.messageService.onValueChanged(this.carForm, this.formErrors);
  }

}
