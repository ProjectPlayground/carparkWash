import { Component, OnInit } from '@angular/core';
import { CarParkService } from '../shared/car-park.service';
import { CarParkModel } from '../shared/car-park.model';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { CarService } from '../../car/shared/car.service';
import { CarModel } from '../../car/shared/car.model';
import { Router } from '@angular/router';
import { Region } from '../car-park-filter/region.enum';
import { CarParkFilterModel } from '../car-park-filter/car-park-filter.model';
import { LoadingService } from '../../shared/loading.service';

@Component({
  selector: 'app-car-park-list',
  templateUrl: './car-park-list.component.html',
  styleUrls: ['./car-park-list.component.css']
})
export class CarParkListComponent implements OnInit {

  selectedCar: CarModel;
  carParks: Array<CarParkModel>;
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
              public loadingService: LoadingService, public snackBar: MdSnackBar, public router: Router) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.selectedCar = this.carService.selectedCar;
  }

  ngOnInit() {
    if (!this.selectedCar) {
      this.router.navigate(['']);
    } else {
      //this.carParkService.getAll()
      //  .then(carParks => this.carParks = carParks)
      //  .catch(err => {
      //    console.log(err);
      //    this.snackBar.open('Error getting Car parks, please contact admin', '', this.snackBarConfig);
      //  });
    }
  }

  getCarParksFilter(carParkFilterModel: CarParkFilterModel) {
    this.loadingService.show(true);
    this.carParkService.getFiltered(carParkFilterModel)
      .then(carParks => {
        this.carParks = carParks;
        this.loadingService.show(false);
      })
      .catch(err => {
        console.log(err);
        this.loadingService.show(false);
        this.snackBar.open('Error getting Car parks, please contact admin', '', this.snackBarConfig);
      });
  }

}
