import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasingConfComponent } from './purchasing-conf.component';

describe('PurchasingConfComponent', () => {
  let component: PurchasingConfComponent;
  let fixture: ComponentFixture<PurchasingConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasingConfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasingConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
