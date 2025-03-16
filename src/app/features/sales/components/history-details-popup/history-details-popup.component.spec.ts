import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryDetailsPopupComponent } from './history-details-popup.component';

describe('HistoryDetailsPopupComponent', () => {
  let component: HistoryDetailsPopupComponent;
  let fixture: ComponentFixture<HistoryDetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryDetailsPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
