import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAuditComponent } from './table-audit.component';

describe('TableAuditComponent', () => {
  let component: TableAuditComponent;
  let fixture: ComponentFixture<TableAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableAuditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
