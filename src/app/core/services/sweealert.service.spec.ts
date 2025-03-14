import { TestBed } from '@angular/core/testing';

import { SweealertService } from './sweealert.service';

describe('SweealertService', () => {
let service: SweealertService;

beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SweealertService);
});

it('should be created', () => {
    expect(service).toBeTruthy();
});
});
