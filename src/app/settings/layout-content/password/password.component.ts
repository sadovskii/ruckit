import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbWindowControlButtonsConfig, NbWindowService } from '@nebular/theme';
import { SetNewPasswordComponent } from './set-new-password/set-new-password.component';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  toggleFormControl: FormControl;

  selectedInquirePassowrdPeriod: number = 10;

  constructor(
    private _dialogService: NbDialogService) {}

  ngOnInit(): void {
    this.initToogleControl();
  }

  initToogleControl() {
    this.toggleFormControl = new FormControl(false);
    this.toggleFormControl.valueChanges.subscribe(t => {

      if (t !== null) {
        if (t) {

          this._dialogService.open(SetNewPasswordComponent,
            {
              hasBackdrop: true,
              autoFocus: false,
              backdropClass: "custom-backdrop"
            }
          )
        }
      }
    })
  }

  onChangeInquirePassowrdPeriod() {
    console.log("selectedInquirePassowrdPeriod = ", this.selectedInquirePassowrdPeriod);
  }
}
