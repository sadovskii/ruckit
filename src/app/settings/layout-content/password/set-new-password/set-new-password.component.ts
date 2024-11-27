import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
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

  public TagType = TagType;
  public invalidAfterClick = false;

  public formGroup = new FormGroup({
    enterPassword: new FormControl(null, Validators.required),
    confirmPassword: new FormControl(null, Validators.required)
  }
)

  constructor(private _refDialog: NbDialogRef<SetNewPasswordComponent>) {
    this.formGroup.setValidators(matchValidator("enterPassword", "confirmPassword"))
  }

  onClose() {
    this._refDialog.close();
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
