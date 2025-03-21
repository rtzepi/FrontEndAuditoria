import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesUnitConfComponent } from './sales-unit-conf.component';

describe('SalesUnitConfComponent', () => {
  let component: SalesUnitConfComponent;
  let fixture: ComponentFixture<SalesUnitConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesUnitConfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesUnitConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
