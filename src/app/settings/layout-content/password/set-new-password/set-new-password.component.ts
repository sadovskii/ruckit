import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TagType } from 'src/app/shared/components/tag/tag.types';
import { matchValidator } from 'src/app/shared/validators/match.validator';

@Component({
  selector: 'app-set-new-password',
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetNewPasswordComponent {

  @Output()
  public submit = new EventEmitter<string>

  @Output()
  public close = new EventEmitter<any>;

  public TagType = TagType;
  public invalidAfterClick = false;

  public formGroup = new FormGroup({
    enterPassword: new FormControl(null, Validators.required),
    confirmPassword: new FormControl(null, Validators.required)
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

    this.submit.emit(this.formGroup.controls.confirmPassword.value!)
    console.log("form is valid");

  }
}
