import { Component, OnInit } from '@angular/core';
import { MdDialogRef, MdSnackBarConfig, MdSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarParkModel } from '../car-park.model';
import { CardinalPartEnum } from '../car-park-filter/cardinal-part-enum';
import { PickImageAbstract } from '../../shared/PickImageAbstract';

@Component({
  selector: 'app-add-car',
  templateUrl: './edit-car-park.dialog.html',
  styleUrls: ['./edit-car-park.dialog.css']
})
export class EditCarParkDialog extends PickImageAbstract implements OnInit {

  // Value input from the caller of the dialog
  carParkToEdit: CarParkModel;
  isPictureLoading = false;

  cardinalPartEnum = CardinalPartEnum;
  carParkForm: FormGroup;
  formErrors = {
    name: '',
    cardinalPart: '',
    area: '',
    address: '',
    //nbPlaces: ''
  };
  private snackBarConfig: MdSnackBarConfig;

  constructor(public dialogRef: MdDialogRef<EditCarParkDialog>, private formBuilder: FormBuilder,
              public messageService: ValidationMessageService, public snackBar: MdSnackBar) {

    super();
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.carParkToEdit = new CarParkModel();
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.carParkForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carParkForm, this.formErrors));
    this.messageService.onValueChanged(this.carParkForm, this.formErrors);
  }

  pickCarParkPicture(event) {
    this.isPictureLoading = true;
    this.loadImage(event).then((res: any) => {
      this.isPictureLoading = false;
      this.carParkToEdit.picture = res.target.result;
    }).catch(err => {
      console.log(err);
      this.isPictureLoading = false;
      this.snackBar.open('Fail to get background', '', this.snackBarConfig);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  save() {
    this.carParkToEdit.name = this.carParkForm.value.name;
    this.carParkToEdit.address = this.carParkForm.value.address;
    this.carParkToEdit.cardinalPart = this.carParkForm.value.cardinalPart;
    this.carParkToEdit.area = this.carParkForm.value.area;
    //this.carParkToEdit.nbPlaces = this.carParkForm.value.nbPlaces;
    this.dialogRef.close(this.carParkToEdit);
  }

  private buildForm() {
    this.carParkForm = this.formBuilder.group({
      name: [this.carParkToEdit.name,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthName),
          Validators.maxLength(this.messageService.maxLengthName)])],
      cardinalPart: [this.carParkToEdit.cardinalPart, Validators.required],
      area: [this.carParkToEdit.area,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthName),
          Validators.maxLength(this.messageService.maxLengthName)])],
      address: [this.carParkToEdit.address,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthAddress),
          Validators.maxLength(this.messageService.maxLengthAddress)])],
      //nbPlaces: [this.carParkToEdit.nbPlaces],
    });
  }

}
