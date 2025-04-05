import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductConfComponent } from './product-conf.component';

describe('ProductConfComponent', () => {
  let component: ProductConfComponent;
  let fixture: ComponentFixture<ProductConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductConfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
