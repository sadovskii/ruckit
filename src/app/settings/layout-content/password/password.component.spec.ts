import { ChangeDetectorRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { RuckitSnackBarService } from 'src/app/shared/components/ruckit-snack-bar/ruckit-snack-bar.service';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { PasswordComponent } from './password.component';

describe('PasswordComponent', () => {
  let component: PasswordComponent;

  beforeEach(() => {
    component = new PasswordComponent(
      {} as NbDialogService,
      {} as GlobalService,
      {} as ChromeService,
      {} as ChangeDetectorRef,
      {} as RuckitSnackBarService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
