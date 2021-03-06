import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { CarParkService } from '../shared/car-park.service';
import { CarParkModel } from '../shared/car-park.model';
import { CarService } from '../../car/shared/car.service';
import { CarModel } from '../../car/shared/car.model';
import { CarParkFilterModel } from '../car-park-filter/car-park-filter.model';

@Component({
  selector: 'app-car-park-list',
  templateUrl: './car-park-list.component.html',
  styleUrls: ['./car-park-list.component.css']
})
export class CarParkListComponent implements OnInit {

  selectedCar: CarModel;
  carParks: Array<CarParkModel>;

  loading = null;

  configCarousel = {
    slidesPerView: 4,
    //slidesPerColumn: 3,
    spaceBetween: 30,
    //grabCursor: true,
    centeredSlides: false,
    //loop: true,
    //autoplay: 5000,
    //autoplayDisableOnInteraction: false,
    paginationClickable: true,
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
  };

  private snackBarConfig: MdSnackBarConfig;

  constructor(public carParkService: CarParkService, public carService: CarService,
              public snackBar: MdSnackBar, public router: Router) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.selectedCar = this.carService.selectedCar;
  }

  ngOnInit() {
    if (!this.selectedCar) {
      this.router.navigate(['']);
    } else {
      this.carParkService.getAll()
       .then(carParks => {
         this.carParks = carParks;
         if (this.carParks.length === 0) {
           this.snackBar.open('No Car Parks added yet', '', this.snackBarConfig);
         }
       })
       .catch(err => {
         console.log(err);
         this.snackBar.open('Error getting Car parks, please contact admin', '', this.snackBarConfig);
       });
    }
  }

  getCarParksFilter(carParkFilterModel: CarParkFilterModel) {
    this.loading = true;
    this.carParkService.getFiltered(carParkFilterModel)
      .then(carParks => {
        this.carParks = carParks;
        if (this.carParks.length === 0) {
          this.snackBar.open('No Car Parks found', '', this.snackBarConfig);
        }
        this.loading = false;
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
        this.snackBar.open('Error getting Car parks, please contact admin', '', this.snackBarConfig);
      });
  }

}
