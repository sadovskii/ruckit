import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NbDialogService, NbWindowControlButtonsConfig, NbWindowService } from '@nebular/theme';
import { SetNewPasswordComponent } from './set-new-password/set-new-password.component';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  toggleFormControl: FormControl;

  selectedInquirePassowrdPeriod: number = 10;

  constructor(private _dialogService: NbDialogService,) {}

  ngOnInit(): void {
    this.initToogleControl();
  }

  initToogleControl() {
    this.toggleFormControl = new FormControl(false);
    this.toggleFormControl.valueChanges.subscribe(t => {

      if (t !== null) {
        if (t) {

          const buttonsConfig: NbWindowControlButtonsConfig = {
            minimize: false,
            maximize: false,
            fullScreen: false,
            close: true,
          };

          this._dialogService.open(SetNewPasswordComponent, { hasBackdrop: true })
        }
      }
    })
  }

  onChangeInquirePassowrdPeriod() {
    console.log("selectedInquirePassowrdPeriod = ", this.selectedInquirePassowrdPeriod);
  }
}
