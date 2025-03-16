import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListDetailComponent } from './product-list-detail.component';

describe('ProductListDetailComponent', () => {
  let component: ProductListDetailComponent;
  let fixture: ComponentFixture<ProductListDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
