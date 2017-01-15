import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CardinalPartEnum, CardinalPart } from './cardinal-part-enum';
import { CarParkService } from '../car-park.service';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { CarParkFilterModel } from './car-park-filter.model';

@Component({
  selector: 'app-car-park-filter',
  templateUrl: './car-park-filter.html',
  styleUrls: ['./car-park-filter.css']
})
export class CarParkFilterComponent implements OnInit {

  selectedCarParkFilter: CarParkFilterModel;
  areasPart: Array<string>
  //areaFilter: string;
  //filteredAreasPart: Array<AreaModel>
  //@ViewChild('selectOptionArea') selectOptionArea: MdSelect;

  @Output() onFilterCarParks = new EventEmitter<CarParkFilterModel>();

  cardinalPartEnum = CardinalPartEnum;

  private snackBarConfig: MdSnackBarConfig;

  constructor(public carParkService: CarParkService, public snackBar: MdSnackBar) {
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.selectedCarParkFilter = new CarParkFilterModel();
    this.areasPart = [];
  }

  ngOnInit() {
  }

  getAreasByPart() {
    this.selectedCarParkFilter.area = undefined;
    if (this.selectedCarParkFilter.cardinalPart) {
      this.carParkService.getAreasByCardinalPart(this.selectedCarParkFilter.cardinalPart)
        .then(areasPart => this.areasPart = areasPart)
        .catch(err => {
          console.error(err);
          this.snackBar.open('Could not get areas, please contact admin', '', this.snackBarConfig);
        });
    }
  }

  filterCarParks() {
    this.onFilterCarParks.emit(this.selectedCarParkFilter);
  }

}
