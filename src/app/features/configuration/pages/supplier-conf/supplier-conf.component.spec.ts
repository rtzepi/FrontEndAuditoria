import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierConfComponent } from './supplier-conf.component';

describe('SupplierConfComponent', () => {
  let component: SupplierConfComponent;
  let fixture: ComponentFixture<SupplierConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierConfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
