import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TagType } from 'src/app/shared/components/tag/tag.types';
import { PasswordService } from '../password.service';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enter-password',
  templateUrl: './enter-password.component.html',
  styleUrl: './enter-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterPasswordComponent implements OnDestroy {

  @Output()
  public submit = new EventEmitter<boolean>

  @Output()
  public close = new EventEmitter<any>

  public TagType = TagType;
  public invalidAfterClick = false;

  private _subscription = new Subscription();

  public formGroup = new FormGroup({
    enterPassword: new FormControl(null, Validators.required)
  })

  constructor(
    private _chr: ChangeDetectorRef,
    private _passwordService: PasswordService,
    protected _dialogRef: NbDialogRef<EnterPasswordComponent>) {}

  onClose() {
    this._dialogRef.close();
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
}
