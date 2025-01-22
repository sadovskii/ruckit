import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { RuckitSnackBarService, Snackbar, SnackbarType, SnackbarActionType } from './ruckit-snack-bar.service';
import { debounceTime, tap } from 'rxjs';
import { ViewVersions } from '../../types';

@Component({
  selector: 'ruckit-snack-bar',
  templateUrl: './ruckit-snack-bar.component.html',
  styleUrl: './ruckit-snack-bar.component.scss'
})
export class RuckitSnackBarComponent {

  @Input()
  public viewVersion: ViewVersions = ViewVersions.large;

  @Input()
  // in rem
  public bottom: number = 1.25;

  @Output()
  public actionClick = new EventEmitter();

  showNotification: boolean = false;
  incommingNotification: Snackbar | undefined = undefined;
  SnackbarType = SnackbarType;
  SnackbarActionType = SnackbarActionType;

  constructor(private _snackbarService: RuckitSnackBarService, private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
      this._snackbarService.snackbar$
          .pipe(
              tap((notification: Snackbar | undefined) => {
                if (notification) {
                  this.incommingNotification = notification;
                  this.showNotification = true;
                } else {
                  this.incommingNotification = undefined;
                  this.showNotification = false;
                }
              }),
              debounceTime(3000),
              tap(() => {
                  this.showNotification = false;
                  this._snackbarService.remove();
                  this._cdr.detectChanges();
              })
          )
          .subscribe();
  }

  close(id: number) {
    this._snackbarService.remove();
  }

  onActionClick(type: SnackbarActionType) {
    if (this.viewVersion == ViewVersions.large) {
      this._snackbarService.action(type)
    }
    else if (this.viewVersion === ViewVersions.small) {
      this.actionClick.emit();
    }
  }
}
