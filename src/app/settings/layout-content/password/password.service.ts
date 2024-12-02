import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { STORAGE_PASSWORD_ID } from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  constructor(private _chromeService: ChromeService) {
  }

  comparePasswordWithStoraged(currentPassword: string): Observable<boolean> {
    return this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_ID).pipe(
      map(storagePassword => storagePassword[STORAGE_PASSWORD_ID]),
      tap(t => console.log('tap = ', t)),
      switchMap(p => of(p === currentPassword)),
      tap(t => console.log('tap = ', t))
    )
  }

  changePassword(password: string): Observable<any> {
    return this._chromeService.storageSyncSet<string>(STORAGE_PASSWORD_ID, password)
  }

  submitChangePassword(currentpassword: string, newPassword: string): Observable<any> {
    return this.comparePasswordWithStoraged(currentpassword).pipe(
      switchMap(result => {
        if (result) {
          return this.changePassword(newPassword);
        }
        else {
          return of(false);
        }
      })
    )
  }
}
