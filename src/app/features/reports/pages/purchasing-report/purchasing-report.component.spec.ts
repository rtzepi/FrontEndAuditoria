import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasingReportComponent } from './purchasing-report.component';

describe('PurchasingReportComponent', () => {
  let component: PurchasingReportComponent;
  let fixture: ComponentFixture<PurchasingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasingReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
