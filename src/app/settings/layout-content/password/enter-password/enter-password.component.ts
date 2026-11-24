import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TagType } from 'src/app/shared/components/tag/tag.types';
import { PasswordService } from '../password.service';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { PasswordResetService, PasswordResetState } from '../password-reset.service';
import { formatRemainingTime } from '../password-reset-time';

@Component({
  selector: 'app-enter-password',
  templateUrl: './enter-password.component.html',
  styleUrl: './enter-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterPasswordComponent implements OnInit, OnDestroy {

  @Output()
  public submit = new EventEmitter<boolean>

  @Output()
  public close = new EventEmitter<any>

  public TagType = TagType;
  public invalidAfterClick = false;
  public resetState: PasswordResetState = { status: 'none' };
  public remainingTime = '';

  private _subscription = new Subscription();

  public formGroup = new FormGroup({
    enterPassword: new FormControl(null, Validators.required)
  })

  constructor(
    private _chr: ChangeDetectorRef,
    private _passwordService: PasswordService,
    private _passwordResetService: PasswordResetService,
    protected _dialogRef: NbDialogRef<EnterPasswordComponent>) {}

  get isResetPending(): boolean {
    return this.resetState.status === 'pending';
  }

  ngOnInit(): void {
    const sub = this._passwordResetService.watchState().subscribe(state => this._onResetStateChanged(state));
    this._subscription.add(sub);
  }

  onClose() {
    this._dialogRef.close();
  }

  onCancelReset() {
    const sub = this._passwordResetService.cancel().subscribe(() => {
      this._onResetStateChanged({ status: 'none' });
    });

    this._subscription.add(sub);
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.invalidAfterClick = true;
      this._chr.detectChanges();
      return;
    }

    const password = this.formGroup.controls.enterPassword.value!;

    const sub = this._passwordService.submitEnterPassword(password).subscribe(result => {
      if (result === false) {
        this.formGroup.controls.enterPassword.setErrors({ passwordIsCorrect: true })
        this.invalidAfterClick = true;
      }
      else {
        this._dialogRef.close();
        this.submit.emit(true);
      }
    });

    this._subscription.add(sub);
  }

  onDetectChanges() {
    this._chr.detectChanges();
  }

  ngOnDestroy(): void {
    console.log('enter password. destroy');
    this._subscription.unsubscribe();
  }

  private _onResetStateChanged(state: PasswordResetState) {
    this.resetState = state;

    if (state.status === 'pending') {
      this.remainingTime = formatRemainingTime(state.remainingMs);
    }

    // the reset is over and the password is gone, so there is nothing left to enter: unlock like a correct password
    if (state.status === 'completed') {
      this._dialogRef.close();
      this.submit.emit(true);
      return;
    }

    this._chr.detectChanges();
  }
}
