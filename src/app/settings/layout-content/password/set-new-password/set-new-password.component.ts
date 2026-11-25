import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RuckitPillOption } from 'src/app/shared/components/ruckit-pill-group/ruckit-pill-group.models';
import { TagType } from 'src/app/shared/components/tag/tag.types';
import { PASSWORD_RESET_DELAY_OPTIONS_MINUTES } from 'src/app/shared/constants';
import { t } from 'src/app/shared/i18n/i18n';
import { matchValidator } from 'src/app/shared/validators/match.validator';
import { getResetDelayLabelKey } from '../password-reset-time';
import { NewPassword } from '../password.models';

// the middle option is selected first, as in the design
const DEFAULT_RESET_DELAY_MINUTES = PASSWORD_RESET_DELAY_OPTIONS_MINUTES[1];

@Component({
  selector: 'app-set-new-password',
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetNewPasswordComponent {

  @Output()
  public submit = new EventEmitter<NewPassword>

  @Output()
  public close = new EventEmitter<any>;

  public TagType = TagType;
  public invalidAfterClick = false;

  public resetDelayOptions: RuckitPillOption[] = PASSWORD_RESET_DELAY_OPTIONS_MINUTES.map(delayMinutes => ({
    value: delayMinutes,
    label: t(getResetDelayLabelKey(delayMinutes)!)
  }));

  public formGroup = new FormGroup({
    enterPassword: new FormControl(null, Validators.required),
    confirmPassword: new FormControl(null, Validators.required),
    resetDelayMinutes: new FormControl(DEFAULT_RESET_DELAY_MINUTES, { nonNullable: true })
  }
)

  constructor() {
    this.formGroup.setValidators(matchValidator("enterPassword", "confirmPassword"))
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {

    console.log(this.formGroup.value);

    if (this.formGroup.invalid) {
      this.invalidAfterClick = true;
      return;
    }

    this.submit.emit({
      password: this.formGroup.controls.confirmPassword.value!,
      resetDelayMinutes: this.formGroup.controls.resetDelayMinutes.value
    })
    console.log("form is valid");

  }
}
