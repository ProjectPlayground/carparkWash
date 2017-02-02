import { Component, EventEmitter, Output, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MdSnackBar, MdSnackBarConfig, MdTabGroup } from '@angular/material';
import { RegionEnum } from './region.enum';
import { CarParkService } from '../shared/car-park.service';
import { CarParkFilterModel } from './car-park-filter.model';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';

@Component({
  selector: 'app-car-park-filter',
  templateUrl: './car-park-filter.html',
  styleUrls: ['./car-park-filter.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarParkFilterComponent implements OnInit {

  carParkFilter: CarParkFilterModel;
  areasOfRegion: Array<string>;
  //areaFilter: string;
  //filteredAreasPart: Array<AreaModel>
  //@ViewChild('selectOptionArea') selectOptionArea: MdSelect;

  loading = null;

  codeFielterForm: FormGroup;
  codeFormErrors = {
    carParkCode: ''
  };

  areaFielterForm: FormGroup;
  areaFormErrors = {
    carParkLotNumber: ''
  };

  @ViewChild(MdTabGroup) tabGroup: MdTabGroup;
  @Output() onFilterCarParks = new EventEmitter<CarParkFilterModel>();

  regionEnum = RegionEnum;
  private snackBarConfig: MdSnackBarConfig;

  constructor(public carParkService: CarParkService, public snackBar: MdSnackBar,
              public formBuilder: FormBuilder, public messageService: ValidationMessageService) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.carParkFilter = new CarParkFilterModel();
    this.areasOfRegion = [];
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }

  getAreasByRegion() {
    this.carParkFilter.area = undefined;
    // if select is opened but none value is selected
    if (this.carParkFilter.region) {
      this.loading = true;
      this.carParkService.getAreasByRegion(this.carParkFilter.region)
        .then(areasOfRegion => {
          this.areasOfRegion = areasOfRegion;
          this.loading = false;
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
          this.snackBar.open('Could not get areas, please contact admin', '', this.snackBarConfig);
        });
    }
  }

  filterCarParks() {
    if (this.tabGroup.selectedIndex === 0) {
      this.carParkFilter.region = undefined;
      this.carParkFilter.area = '';
    } else {
      this.carParkFilter.code = '';
    }
    this.onFilterCarParks.emit(this.carParkFilter);
  }

  private buildForm() {
    this.codeFielterForm = this.formBuilder.group({
      carParkCode: ['', Validators.required]
    });
    this.codeFielterForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.codeFielterForm, this.codeFormErrors));
    this.messageService.onValueChanged(this.codeFielterForm, this.codeFormErrors);

    this.areaFielterForm = this.formBuilder.group({
      carParkRegion: ['', Validators.required],
      carParkArea: ['']
    });
    this.areaFielterForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.areaFielterForm, this.areaFormErrors));
    this.messageService.onValueChanged(this.areaFielterForm, this.areaFormErrors);
  }
}
