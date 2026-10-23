import { ChangeDetectorRef } from '@angular/core';
import { RuckitDialogComponent } from './ruckit-dialog.component';

describe('RuckitDialogComponent', () => {
  let component: RuckitDialogComponent;

  beforeEach(() => {
    component = new RuckitDialogComponent({} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
