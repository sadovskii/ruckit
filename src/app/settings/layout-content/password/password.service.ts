import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { STORAGE_PASSWORD_ID } from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  constructor(private _chromeService: ChromeService) {
  }

  submitChangePassword(currentpassword: string, newPassword: string): Observable<any> {
    return this._comparePasswordWithStoraged(currentpassword).pipe(
      switchMap(result => {
        if (result) {
          return this._changePassword(newPassword);
        }
        else {
          return of(false);
        }
      })
    )
  }

  submitEnterPassword(password: string): Observable<boolean> {
    return this._comparePasswordWithStoraged(password);
  }

  private _comparePasswordWithStoraged(currentPassword: string): Observable<boolean> {
    return this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_ID).pipe(
      switchMap(p => of(p === currentPassword)),
    )
  }

  private _changePassword(password: string): Observable<any> {
    return this._chromeService.storageSyncSet<string>(STORAGE_PASSWORD_ID, password)
  }
}
