import { Component, OnInit } from '@angular/core';
import { MdDialogRef, MdSnackBarConfig, MdSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarParkModel } from '../shared/car-park.model';
import { RegionEnum } from '../car-park-filter/region.enum';
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

  regionEnum = RegionEnum;
  carParkForm: FormGroup;
  formErrors = {
    carParkName: '',
    carParkCode: '',
    region: '',
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
    this.carParkToEdit.name = this.carParkForm.value.carParkName;
    this.carParkToEdit.code = this.carParkForm.value.carParkCode;
    this.carParkToEdit.address = this.carParkForm.value.address;
    // this.carParkToEdit.region = this.carParkForm.value.region;
    // this.carParkToEdit.area = this.carParkForm.value.area;
    //this.carParkToEdit.nbPlaces = this.carParkForm.value.nbPlaces;
    this.dialogRef.close({
      carpark: this.carParkToEdit,
      area: this.carParkForm.value.area,
      region: this.carParkForm.value.region
    });
  }

  private buildForm() {
    this.carParkForm = this.formBuilder.group({
      carParkName: [this.carParkToEdit.name,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthCarParkName),
          Validators.maxLength(this.messageService.maxLengthCarParkName)])],
      carParkCode: [this.carParkToEdit.code,
        Validators.compose([Validators.required,
          Validators.maxLength(this.messageService.maxLengthCarParkCode)])],
      region: [this.carParkToEdit.region, Validators.required],
      area: [this.carParkToEdit.area,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthArea),
          Validators.maxLength(this.messageService.maxLengthArea)])],
      address: [this.carParkToEdit.address,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthAddress),
          Validators.maxLength(this.messageService.maxLengthAddress)])],
      //nbPlaces: [this.carParkToEdit.nbPlaces],
    });
    this.carParkForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carParkForm, this.formErrors));
    this.messageService.onValueChanged(this.carParkForm, this.formErrors);
  }

}
