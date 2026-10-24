import { ChangeDetectorRef } from '@angular/core';
import { RuckitSnackBarComponent } from './ruckit-snack-bar.component';
import { RuckitSnackBarService } from './ruckit-snack-bar.service';

describe('RuckitSnackBarComponent', () => {
  let component: RuckitSnackBarComponent;

  beforeEach(() => {
    component = new RuckitSnackBarComponent(new RuckitSnackBarService(), {} as ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
