import { ChangeDetectorRef } from '@angular/core';
import { RuckitOptionListComponent } from './ruckit-option-list.component';

describe('RuckitOptionListComponent', () => {
  let component: RuckitOptionListComponent;

  beforeEach(() => {
    component = new RuckitOptionListComponent({} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
