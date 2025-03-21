import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyConfComponent } from './company-conf.component';

describe('CompanyConfComponent', () => {
  let component: CompanyConfComponent;
  let fixture: ComponentFixture<CompanyConfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyConfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
