import { ChangeDetectorRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { of, Subject } from 'rxjs';
import { PasswordResetService, PasswordResetState } from '../password-reset.service';
import { PasswordService } from '../password.service';
import { EnterPasswordComponent } from './enter-password.component';

describe('EnterPasswordComponent', () => {
  let component: EnterPasswordComponent;
  let resetStates: Subject<PasswordResetState>;
  let cancelReset: jasmine.Spy;
  let dialogRef: jasmine.SpyObj<NbDialogRef<EnterPasswordComponent>>;

  beforeEach(() => {
    resetStates = new Subject<PasswordResetState>();
    cancelReset = jasmine.createSpy('cancel').and.returnValue(of(undefined));
    dialogRef = jasmine.createSpyObj('NbDialogRef', ['close']);

    component = new EnterPasswordComponent(
      { detectChanges: () => {} } as ChangeDetectorRef,
      {} as PasswordService,
      { watchState: () => resetStates, cancel: cancelReset } as unknown as PasswordResetService,
      dialogRef
    );
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has no reset in progress by default', () => {
    expect(component.isResetPending).toBeFalse();
  });

  it('shows the time left while a reset is pending', () => {
    resetStates.next({ status: 'pending', endsAt: 0, remainingMs: (2 * 3600 + 5 * 60 + 9) * 1000 });

    expect(component.isResetPending).toBeTrue();
    expect(component.remainingTime).toBe('02:05:09');
  });

  it('cancelling the reset stops showing it', () => {
    resetStates.next({ status: 'pending', endsAt: 0, remainingMs: 1000 });

    component.onCancelReset();

    expect(cancelReset).toHaveBeenCalled();
    expect(component.isResetPending).toBeFalse();
  });

  it('closes and unlocks when the reset ends while the dialog is open', () => {
    const submitted = jasmine.createSpy('submit');
    component.submit.subscribe(submitted);

    resetStates.next({ status: 'completed' });

    expect(dialogRef.close).toHaveBeenCalled();
    expect(submitted).toHaveBeenCalledOnceWith(true);
  });
});
