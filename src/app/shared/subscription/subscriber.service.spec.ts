/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SubscriberService } from './subscriber.service';

describe('SubscriberService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubscriberService]
    });
  });

  it('should ...', inject([SubscriberService], (service: SubscriberService) => {
    expect(service).toBeTruthy();
  }));
});
