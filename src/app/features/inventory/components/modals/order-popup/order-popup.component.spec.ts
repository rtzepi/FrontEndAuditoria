import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPopupComponent } from './order-popup.component';

describe('OrderPopupComponent', () => {
  let component: OrderPopupComponent;
  let fixture: ComponentFixture<OrderPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
