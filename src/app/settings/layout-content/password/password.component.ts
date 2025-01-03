import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NbDialogService, NbGlobalLogicalPosition, NbGlobalPhysicalPosition } from '@nebular/theme';
import { SetNewPasswordComponent } from './set-new-password/set-new-password.component';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { BACKDROP_CLASS, STORAGE_FREE_PASSWORD_PERIOD_ID, STORAGE_PASSWORD_ID } from 'src/app/shared/constants';
import { map, of, Subscription, switchMap } from 'rxjs';
import { EnterPasswordComponent } from './enter-password/enter-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RuckitSnackBarService, SnackbarActionType } from 'src/app/shared/components/ruckit-snack-bar/ruckit-snack-bar.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordComponent implements OnInit, OnDestroy {
  selectedInquirePassowrdPeriod: number | undefined = undefined;
  isHasPassword: boolean | null = null;

  private _subscriptions = new Subscription();

  constructor(
    private _dialogService: NbDialogService,
    public _globalService: GlobalService,
    private _chromeService: ChromeService,
    private _cdr: ChangeDetectorRef,
    private _snackbarService: RuckitSnackBarService
  ) {}

  ngOnInit(): void {
    this.initInquirePasswordPeriod();

    this._globalService.getHasPassword$().subscribe(t => {
      this.isHasPassword = t;
      this._cdr.detectChanges();
    })
  }

  initInquirePasswordPeriod() {
    const sub = this._chromeService.storageSyncGetItem(STORAGE_FREE_PASSWORD_PERIOD_ID).subscribe(period => {
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
    console.log('onRequestToggleClick');
    if (this.isHasPassword === null) {
      return;
    }

    if (this.isHasPassword) {
      this.initEnterPassword();
    }
    else {
      this.initSetNewPassword();
    }
  }

  submitChangePassword(result: boolean) {
    if (result) {
      this._snackbarService.success(SnackbarActionType.undefined);
    }
    else {
      console.log('should be restricted');
      this._snackbarService.restricted();
    }
    console.log("submitChangePassword = ", result);
  }

  // initialize open set new password window, handle submit and close
  private initEnterPassword() {
    const ref = this._dialogService.open(EnterPasswordComponent,
      {
        hasBackdrop: true,
        autoFocus: false,
        backdropClass: BACKDROP_CLASS
      }
    );

    let sub = ref.componentRef.instance.submit.pipe(
      switchMap(_ => {
        return this._chromeService.storageSyncRemove(STORAGE_PASSWORD_ID)
      })
    ).subscribe(_ => {
      this._globalService.setHasPassword$(false);
        this._cdr.detectChanges();
    })

    this._subscriptions.add(sub);
  }

  // initialize open set new password window, handle submit and close
  private initSetNewPassword() {
    const ref = this._dialogService.open(SetNewPasswordComponent,
      {
        hasBackdrop: true,
        autoFocus: false,
        backdropClass: BACKDROP_CLASS
      }
    );

    let sub = ref.componentRef.instance.submit.pipe(
      switchMap(password => this._chromeService.storageSyncSet<string>(STORAGE_PASSWORD_ID, password))
      ).subscribe(_ => {
        ref.close();
        this._globalService.setHasPassword$(true);
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
