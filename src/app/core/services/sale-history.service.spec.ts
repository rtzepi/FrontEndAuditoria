import { TestBed } from '@angular/core/testing';

import { SaleHistoryService } from './sale-history.service';

describe('SaleHistoryService', () => {
  let service: SaleHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
