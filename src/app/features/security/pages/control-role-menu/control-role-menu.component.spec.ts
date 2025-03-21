import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlRoleMenuComponent } from './control-role-menu.component';

describe('ControlRoleMenuComponent', () => {
  let component: ControlRoleMenuComponent;
  let fixture: ComponentFixture<ControlRoleMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlRoleMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlRoleMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
