import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesMenuComponent } from './sales-menu.component';

describe('SalesMenuComponent', () => {
  let component: SalesMenuComponent;
  let fixture: ComponentFixture<SalesMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
