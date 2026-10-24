import { ChangeDetectorRef } from '@angular/core';
import { HideListBlockItemComponent } from './hide-list-block-item.component';

describe('HideListBlockItemComponent', () => {
  let component: HideListBlockItemComponent;

  beforeEach(() => {
    component = new HideListBlockItemComponent({} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
