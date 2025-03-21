import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCategoryConfComponent } from './product-category-conf.component';

describe('ProductCategoryConfComponent', () => {
  let component: ProductCategoryConfComponent;
  let fixture: ComponentFixture<ProductCategoryConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCategoryConfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCategoryConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
