import { ChangeDetectorRef, Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgControl } from '@angular/forms';
import { NbButtonComponent, NbDialogService } from '@nebular/theme';
import { first, Subscription } from 'rxjs';
import { RuckitSnackBarService, SnackbarActionType } from '../../components/ruckit-snack-bar/ruckit-snack-bar.service';
import { EnterPasswordComponent } from 'src/app/settings/layout-content/password/enter-password/enter-password.component';
import { BACKDROP_CLASS } from '../../constants';
import { GlobalService } from '../../services/global/global.service';

@Directive({
  selector: '[restrictedButton]'
})
export class RestrictedButtonDirective implements OnDestroy {

  @Input()
  public lock: boolean = false;

  @Output()
  public restricedClick = new EventEmitter();

  private _subscriptions = new Subscription();

  constructor(
    private _snackbarService: RuckitSnackBarService,
    private _dialogService: NbDialogService,
    private _cdr: ChangeDetectorRef,
    private _globalService: GlobalService,
  ) { }

  @HostListener('click', ['$event'])
  clickEvent() {
    if (this.lock) {
      this._snackbarService.restricted();
      this._initSnackbarAction();
    }
    else {
      this.restricedClick.emit();
    }
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

    let sub = ref.componentRef.instance.submit.pipe(
      first()
      ).subscribe(_ => {
        this._globalService.setIsPasswordFreeSession$(true);
        this.restricedClick.emit();
        this._cdr.detectChanges();
      })

    this._subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
