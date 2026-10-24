import { ChangeDetectorRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { RuckitSnackBarService } from '../../components/ruckit-snack-bar/ruckit-snack-bar.service';
import { GlobalService } from '../../services/global/global.service';
import { RestrictedButtonDirective } from './restricted-button.directive';

describe('RestrictedButtonDirective', () => {
  it('should create an instance', () => {
    const directive = new RestrictedButtonDirective(
      {} as RuckitSnackBarService,
      {} as NbDialogService,
      {} as ChangeDetectorRef,
      {} as GlobalService
    );
    expect(directive).toBeTruthy();
  });
});
