import { TestBed } from '@angular/core/testing';

import { NewPurchaseService } from './new-purchase.service';

describe('NewPurchaseService', () => {
  let service: NewPurchaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewPurchaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
