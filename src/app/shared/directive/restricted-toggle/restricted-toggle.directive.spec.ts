import { ChangeDetectorRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { NbDialogService } from '@nebular/theme';
import { RuckitSnackBarService } from '../../components/ruckit-snack-bar/ruckit-snack-bar.service';
import { GlobalService } from '../../services/global/global.service';
import { RestrictedToggleDirective } from './restricted-toggle.directive';

describe('RestrictedToggleDirective', () => {
  let directive: RestrictedToggleDirective;

  beforeEach(() => {
    directive = new RestrictedToggleDirective(
      {} as NgControl,
      {} as GlobalService,
      {} as NbDialogService,
      {} as ChangeDetectorRef,
      {} as RuckitSnackBarService
    );
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
