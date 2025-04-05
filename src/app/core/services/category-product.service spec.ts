import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CategoryProductService } from './category-product.service';

describe('CategoryProductService', () => {
  let service: CategoryProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({
imports: [HttpClientTestingModule],
      providers: [CategoryProductService]
    });
    service = TestBed.inject(CategoryProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});