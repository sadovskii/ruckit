import { ChangeDetectorRef } from '@angular/core';
import { RuckitToggleComponent } from './ruckit-toggle.component';

describe('RuckitToggleComponent', () => {
  let component: RuckitToggleComponent;

  beforeEach(() => {
    component = new RuckitToggleComponent({} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
