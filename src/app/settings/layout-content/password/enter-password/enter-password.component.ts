import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TagType } from 'src/app/shared/components/tag/tag.types';

@Component({
  selector: 'app-enter-password',
  templateUrl: './enter-password.component.html',
  styleUrl: './enter-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterPasswordComponent {

  @Output()
  public submit = new EventEmitter<string>

  @Output()
  public close = new EventEmitter<any>

  public TagType = TagType;
  public invalidAfterClick = false;

  public formGroup = new FormGroup({
    enterPassword: new FormControl(null, Validators.required)
  })

  constructor(private _chr: ChangeDetectorRef) {

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

    this.submit.emit(this.formGroup.controls.enterPassword.value!)
    console.log("form is valid");
  }

  onDetectChanges() {
    this._chr.detectChanges();
  }
}
