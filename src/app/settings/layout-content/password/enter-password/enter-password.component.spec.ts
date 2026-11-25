import { ChangeDetectorRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { of, Subject } from 'rxjs';
import { formatRemainingTime, getLocalizedRemainingTimeUnits } from '../password-reset-time';
import { PasswordResetService, PasswordResetState } from '../password-reset.service';
import { PasswordService } from '../password.service';
import { EnterPasswordComponent } from './enter-password.component';

describe('EnterPasswordComponent', () => {
  let component: EnterPasswordComponent;
  let resetStates: Subject<PasswordResetState>;
  let cancelReset: jasmine.Spy;
  let startReset: jasmine.Spy;
  let dialogRef: jasmine.SpyObj<NbDialogRef<EnterPasswordComponent>>;

  beforeEach(() => {
    resetStates = new Subject<PasswordResetState>();
    cancelReset = jasmine.createSpy('cancel').and.returnValue(of(undefined));
    startReset = jasmine.createSpy('start').and.returnValue(of(undefined));
    dialogRef = jasmine.createSpyObj('NbDialogRef', ['close']);

    component = new EnterPasswordComponent(
      { detectChanges: () => {} } as ChangeDetectorRef,
      {} as PasswordService,
      {
        watchState: () => resetStates,
        cancel: cancelReset,
        start: startReset,
        getDelayMinutes: () => of(240),
        getState: () => of<PasswordResetState>({ status: 'pending', endsAt: 0, remainingMs: 240 * 60 * 1000 })
      } as unknown as PasswordResetService,
      dialogRef
    );
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // outside an extension page the unit labels are the message keys, so build the expected text the same way
  const expectedRemainingTime = (seconds: number) =>
    formatRemainingTime(seconds * 1000, getLocalizedRemainingTimeUnits());

  it('has no reset in progress by default', () => {
    expect(component.isResetPending).toBeFalse();
  });

  it('shows the time left while a reset is pending', () => {
    resetStates.next({ status: 'pending', endsAt: 0, remainingMs: (2 * 3600 + 5 * 60 + 9) * 1000 });

    expect(component.isResetPending).toBeTrue();
    expect(component.remainingTime).toBe(expectedRemainingTime(2 * 3600 + 5 * 60 + 9));
  });

  it('cancelling the reset stops showing it', () => {
    resetStates.next({ status: 'pending', endsAt: 0, remainingMs: 1000 });

    component.onCancelReset();

    expect(cancelReset).toHaveBeenCalled();
    expect(component.isResetPending).toBeFalse();
  });

  it('"Forgot password?" opens the confirmation with the saved delay', () => {
    component.onForgotPassword();

    expect(component.view).toBe('confirmReset');
    expect(component.delayMinutes).toBe(240);
    expect(component.tagIcon).toBe('closed-lock-16');
  });

  it('"Go back" returns to entering the password and starts no reset', () => {
    component.onForgotPassword();

    component.onGoBack();

    expect(component.view).toBe('enter');
    expect(startReset).not.toHaveBeenCalled();
  });

  it('"Start reset" starts the reset and shows it in progress', () => {
    component.onForgotPassword();

    component.onStartReset();

    expect(startReset).toHaveBeenCalled();
    expect(component.view).toBe('enter');
    expect(component.isResetPending).toBeTrue();
    expect(component.remainingTime).toBe(expectedRemainingTime(4 * 3600));
  });

  it('closes and unlocks when the reset ends while the dialog is open', () => {
    const submitted = jasmine.createSpy('submit');
    component.submit.subscribe(submitted);

    resetStates.next({ status: 'completed' });

    expect(dialogRef.close).toHaveBeenCalled();
    expect(submitted).toHaveBeenCalledOnceWith(true);
  });
});
