import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedOrderComponent } from './created-order.component';

describe('CreatedOrderComponent', () => {
  let component: CreatedOrderComponent;
  let fixture: ComponentFixture<CreatedOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatedOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatedOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
