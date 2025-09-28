import { TestBed } from '@angular/core/testing';

import { TableAuditService } from './table-audit.service';

describe('TableAuditService', () => {
  let service: TableAuditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableAuditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
