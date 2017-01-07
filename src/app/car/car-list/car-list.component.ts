import { Component, OnInit } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { CarService } from '../../car/car.service';
import { CarModel } from '../../car/car.model';
import { Router } from '@angular/router';
import { CarParkModel } from '../../car-park/car-park.model';
import { CarParkService } from '../../car-park/car-park.service';
import { SubscriptionModel } from '../../shared/subscription/subscription.model';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit {

  selectedCarPark: CarParkModel;
  cars: Array<CarModel>;
  subscriptions: Array<SubscriptionModel>;
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

    this.selectedCarPark = this.carParkService.selectedCarPark;

    if (!this.selectedCarPark) {
      this.router.navigate(['']);
    }
  }

  ngOnInit() {
    this.carService.getByCarPark(this.carParkService.selectedCarPark)
      .then((subscriptions: Array<SubscriptionModel>) => this.subscriptions = subscriptions)
      .catch(err => {
        console.log(err);
        this.snackBar.open('Error getting all selectedCar parks, please contact admin', '', this.snackBarConfig);
      });
  }

}
