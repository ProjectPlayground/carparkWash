/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditCarDialog } from './edit-car.dialog';

describe('EditCarDialog', () => {
  let component: EditCarDialog;
  let fixture: ComponentFixture<EditCarDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCarDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCarDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
