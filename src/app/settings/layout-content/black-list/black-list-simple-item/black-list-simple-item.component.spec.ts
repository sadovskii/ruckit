import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackListSimpleItemComponent } from './black-list-simple-item.component';

describe('BlackListSimpleItemComponent', () => {
  let component: BlackListSimpleItemComponent;
  let fixture: ComponentFixture<BlackListSimpleItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlackListSimpleItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlackListSimpleItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
