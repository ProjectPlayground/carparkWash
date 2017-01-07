import { Component, OnInit } from '@angular/core';
import { CarParkService } from '../car-park.service';
import { CarParkModel } from '../car-park.model';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { CarService } from '../../car/car.service';
import { CarModel } from '../../car/car.model';
import { Router } from '@angular/router';

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
    slidesPerColumn: 3,
    spaceBetween: 30,
    //grabCursor: true,
    centeredSlides: false,
    //loop: true,
    autoplay: 5000,
    autoplayDisableOnInteraction: false,
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
    if (!this.selectedCar) {
      this.router.navigate(['']);
    }
  }

  ngOnInit() {
    this.carParkService.getAll()
      .then(carParks => this.carParks = carParks)
      .catch(err => {
        console.log(err);
        this.snackBar.open('Error getting all selectedCar parks, please contact admin', '', this.snackBarConfig);
      });
  }

}
