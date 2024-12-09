import { Component } from '@angular/core';
import { RuckitSnackBarService, Snackbar, SnackbarType, SnackbarActionType } from './ruckit-snack-bar.service';
import { debounceTime, tap } from 'rxjs';

@Component({
  selector: 'ruckit-snack-bar',
  templateUrl: './ruckit-snack-bar.component.html',
  styleUrl: './ruckit-snack-bar.component.scss'
})
export class RuckitSnackBarComponent {
  showNotification: boolean = false;
  incommingNotification: Snackbar | undefined = undefined;
  SnackbarType = SnackbarType;
  SnackbarActionType = SnackbarActionType;

  constructor(private _snackbarService: RuckitSnackBarService) {}

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
              })
          )
          .subscribe();
  }

  close(id: number) {
    this._snackbarService.remove();
  }

  actionClick(type: SnackbarActionType) {
    this._snackbarService.action(type)
  }
}
