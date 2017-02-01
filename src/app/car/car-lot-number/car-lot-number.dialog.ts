import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from "@angular/material";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ValidationMessageService } from "../../shared/validator/validation-message.service";

@Component({
  selector: 'app-car-lot-number',
  templateUrl: './car-lot-number.dialog.html',
  styleUrls: ['./car-lot-number.dialog.css']
})
export class CarLotNumberDialog implements OnInit {

  form: FormGroup;
  formErrors = {
    carParkLotNumber: ''
  };

  constructor(public dialogRef: MdDialogRef<CarLotNumberDialog>, private formBuilder: FormBuilder,
              public messageService: ValidationMessageService) {
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }

  cancel() {
    this.dialogRef.close(false);
  }

  select() {
    this.dialogRef.close(this.form.value.carParkLotNumber);
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      carParkLotNumber: ['', Validators.compose([Validators.required,
        Validators.maxLength(this.messageService.maxLengthCarParkLotNumber)])],
    });
    this.form.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.form, this.formErrors));
    this.messageService.onValueChanged(this.form, this.formErrors);
  }

}
