/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CarLotNumberDialog } from './car-lot-number.dialog';

describe('CarLotNumberComponent', () => {
  let component: CarLotNumberDialog;
  let fixture: ComponentFixture<CarLotNumberDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarLotNumberDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarLotNumberDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
