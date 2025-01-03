import { ChangeDetectorRef, Directive, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { RuckitToggleComponent } from '../../components/ruckit-toggle/ruckit-toggle.component';
import { GlobalService } from '../../services/global/global.service';
import { NbDialogService } from '@nebular/theme';
import { EnterPasswordComponent } from 'src/app/settings/layout-content/password/enter-password/enter-password.component';
import { BACKDROP_CLASS } from '../../constants';
import { first, Subscription } from 'rxjs';
import { RuckitSnackBarService, SnackbarActionType } from '../../components/ruckit-snack-bar/ruckit-snack-bar.service';

@Directive({
  selector: '[restrictedToggle]',
})
export class RestrictedToggleDirective implements OnInit, OnDestroy {

  private _subscriptions = new Subscription();
  private _rugckitToggle: RuckitToggleComponent;

  constructor(
    private _ngControl: NgControl,
    private _globalService: GlobalService,
    private _dialogService: NbDialogService,
    private _cdr: ChangeDetectorRef,
    private _snackbarService: RuckitSnackBarService) {}

  ngOnInit(): void {
    this._rugckitToggle = this._ngControl.valueAccessor as RuckitToggleComponent;
    this._rugckitToggle.preventDefault = true;

    const sub = this._rugckitToggle.onClick.subscribe(t => {
      if (this._rugckitToggle.lock) {
        if (this._rugckitToggle.checked) {
          this._snackbarService.restricted();
          this._initSnackbarAction();
        }
        else {
          this._rugckitToggle.onToggleChange(!this._rugckitToggle.checked);
        }
      }
      else  {
        this._rugckitToggle.onToggleChange(!this._rugckitToggle.checked);
      }
    })

    this._subscriptions.add(sub);
  }

  private _initSnackbarAction() {
    const sub = this._snackbarService.action$
      .pipe(
        first()
      ).subscribe(t => {
      if (t === SnackbarActionType.enterPassword) {
        this._initEnterPassword();
      }
    });

    this._subscriptions.add(sub);
  }

  private _initEnterPassword() {
    const ref = this._dialogService.open(EnterPasswordComponent,
      {
        hasBackdrop: true,
        autoFocus: false,
        backdropClass: BACKDROP_CLASS
      }
    );

    console.log("_initEnterPassword()");
    let sub = ref.componentRef.instance.submit.pipe(
      first()
      ).subscribe(_ => {
        this._globalService.setIsPasswordFreeSession$(true);
        this._rugckitToggle.onToggleChange(!this._rugckitToggle.checked)
        this._cdr.detectChanges();
      })

    this._subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}