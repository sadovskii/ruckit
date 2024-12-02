import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NbDialogService, NbGlobalLogicalPosition, NbGlobalPhysicalPosition } from '@nebular/theme';
import { SetNewPasswordComponent } from './set-new-password/set-new-password.component';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { STORAGE_FREE_PASSWORD_PERIOD_ID, STORAGE_PASSWORD_ID } from 'src/app/shared/constants';
import { map, of, Subscription, switchMap } from 'rxjs';
import { EnterPasswordComponent } from './enter-password/enter-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordComponent implements OnInit, OnDestroy {
  passwordRequestToggleControl: FormControl;
  selectedInquirePassowrdPeriod: number | undefined = undefined;
  isHasPassword: boolean | null = null;

  private _subscriptions = new Subscription();
  private readonly backdropClass = 'custom-backdrop';

  constructor(
    private _dialogService: NbDialogService,
    public _globalService: GlobalService,
    private _chromeService: ChromeService,
    private _cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initInquirePasswordPeriod();
    this.initPasswordRequestToggleControl();

    this._globalService.getHasPassword$().subscribe(t => {
      this.isHasPassword = t;
      this._cdr.detectChanges();
    })
  }

  initPasswordRequestToggleControl() {
    this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_ID).subscribe(value => {
      const password = value[STORAGE_PASSWORD_ID];

      if (password) {
        this.passwordRequestToggleControl = new FormControl(true);
      }
      else {
        this.passwordRequestToggleControl = new FormControl(false);
      }

      console.log("control value = ", this.passwordRequestToggleControl.value);
      this._cdr.detectChanges();
    })
  }

  initInquirePasswordPeriod() {
    const sub = this._chromeService.storageSyncGetItem(STORAGE_FREE_PASSWORD_PERIOD_ID).subscribe(value => {
      const period = value[STORAGE_FREE_PASSWORD_PERIOD_ID];
      if (period) {
        this.selectedInquirePassowrdPeriod = period;
      }
      else {
        this.selectedInquirePassowrdPeriod = 30;
      }
      this._cdr.detectChanges();
    })

    this._subscriptions.add(sub);
  }

  onChangeInquirePassowrdPeriod() {
    const sub = this._chromeService.storageSyncSet<number>(STORAGE_FREE_PASSWORD_PERIOD_ID, this.selectedInquirePassowrdPeriod!)
      .subscribe();
    this._subscriptions.add(sub);
  }

  onRequestToggleClick() {
    if (this.passwordRequestToggleControl.value === null) {
      return;
    }

    if (this.passwordRequestToggleControl.value) {
      this.initEnterPassword();
    }
    else {
      this.initSetNewPassword();
    }
  }

  submitChangePassword(result: boolean) {
    console.log("submitChangePassword = ", result);
  }

  // initialize open set new password window, handle submit and close
  private initEnterPassword() {
    const ref = this._dialogService.open(EnterPasswordComponent,
      {
        hasBackdrop: true,
        autoFocus: false,
        backdropClass: this.backdropClass
      }
    );

    let sub = ref.componentRef.instance.submit.pipe(
      switchMap(password =>
        this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_ID).pipe(
            map(storagePassword => storagePassword[STORAGE_PASSWORD_ID]), 
            map(storagePassword => ({ password, storagePassword }))
          )
        ),
      switchMap(p => {
        if (p.password === p.storagePassword) {
          return this._chromeService.storageSyncRemove(STORAGE_PASSWORD_ID)
        }
        else {
          return of(false)
        }
      })
    ).subscribe(result => {
      // entered password isn't equal to storage password
      if (result === false) {
        ref.componentRef.instance.formGroup.controls.enterPassword.setErrors({ passwordIsCorrect: true })
        ref.componentRef.instance.invalidAfterClick = true;
      }
      // entered password is equal to storage password
      else {
        this._globalService.setHasPassword$(false);
        this.passwordRequestToggleControl.setValue(false);
        ref.close();
        this._cdr.detectChanges();
      }
    })

    sub = ref.componentRef.instance.close.subscribe(_ => {
      ref.close();
    })

    this._subscriptions.add(sub);
  }

  // initialize open set new password window, handle submit and close
  private initSetNewPassword() {
    const ref = this._dialogService.open(SetNewPasswordComponent,
      {
        hasBackdrop: true,
        autoFocus: false,
        backdropClass: this.backdropClass
      }
    );

    let sub = ref.componentRef.instance.submit.pipe(
      switchMap(password => this._chromeService.storageSyncSet<string>(STORAGE_PASSWORD_ID, password))
      ).subscribe(_ => {
        ref.close();
        this._globalService.setHasPassword$(true);
        this.passwordRequestToggleControl.setValue(true);
        this._cdr.detectChanges();
      });
    
    this._subscriptions.add(sub);

    sub = ref.componentRef.instance.close.subscribe(_ => {
      ref.close();
    })

    this._subscriptions.add(sub);
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }
}
