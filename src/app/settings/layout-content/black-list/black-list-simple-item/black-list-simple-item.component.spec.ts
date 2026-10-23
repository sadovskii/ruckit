import { ChangeDetectorRef } from '@angular/core';
import { BlackListSimpleItemComponent } from './black-list-simple-item.component';

describe('BlackListSimpleItemComponent', () => {
  let component: BlackListSimpleItemComponent;

  beforeEach(() => {
    component = new BlackListSimpleItemComponent({} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
