import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PasswordService } from '../password.service';
import { matchValidator } from 'src/app/shared/validators/match.validator';
import { of, Subscription, switchMap } from 'rxjs';
import { MAX_LENGTH_RESTRICTION } from '../../black-list/black-list.models';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnDestroy {
  @Input()
  get disabled() : boolean {
    return this._disabled;
  }

  set disabled(d: boolean) {
    this._disabled = d;

    if (this._disabled) {
      this.formGroup.disable();
      this.formGroup.reset();
    }
    else {
      this.formGroup.enable();
    }
  }

  @Input()
  public invalidAfterClick: boolean = false;

  @Output()
  public onSubmit = new EventEmitter<boolean>;

  private _disabled: boolean;
  private _subscription = new Subscription();

  public formGroup = new FormGroup({
    enterCurrentPassword: new FormControl('', [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)]),
    enterNewPassword: new FormControl('', [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)]),
    confirmNewPassword: new FormControl('', [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)])
  })

  constructor(
    private _passwordService: PasswordService,
    private _cdr: ChangeDetectorRef) {
    this.formGroup.setValidators(matchValidator("enterNewPassword", "confirmNewPassword"))
  }

  submit() {
    // to check match required and match validators
    if (this.formGroup.invalid) {
      this.invalidAfterClick = true;
      return;
    }

    const currentPassword = this.formGroup.controls.enterCurrentPassword.value!;
    const newPassword = this.formGroup.controls.confirmNewPassword.value!;
  
    const sub = this._passwordService.submitChangePassword(currentPassword, newPassword)
      .subscribe(validationResult => {
        if (validationResult == false) {
          this.formGroup.controls.enterCurrentPassword.setErrors({ passwordIsCorrect: true })
          this.invalidAfterClick = true;
          this.onSubmit.emit(false);
          this._cdr.detectChanges();
          return;
        }
        else {
          this.invalidAfterClick = false;
          this.formGroup.reset();
          this._cdr.detectChanges();
          this.onSubmit.emit(true);
        }
      })
    
    this._subscription.add(sub);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
