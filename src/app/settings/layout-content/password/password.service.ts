import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import {
  STORAGE_PASSWORD_ID,
  STORAGE_PASSWORD_RESET_DELAY_ID,
  STORAGE_PASSWORD_RESET_ENDS_AT_ID
} from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { PasswordResetService } from './password-reset.service';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  constructor(
    private _chromeService: ChromeService,
    private _passwordResetService: PasswordResetService) {
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

  // knowing the password makes a pending reset pointless, so a correct password cancels it
  submitEnterPassword(password: string): Observable<boolean> {
    return this._comparePasswordWithStoraged(password).pipe(
      switchMap(isCorrect => {
        if (!isCorrect) {
          return of(false);
        }

        return this._passwordResetService.cancel().pipe(map(() => true));
      })
    );
  }

  // removes the password together with its reset delay and a pending reset
  removePassword(): Observable<void> {
    return this._chromeService.storageSyncRemoveItems([
      STORAGE_PASSWORD_ID,
      STORAGE_PASSWORD_RESET_DELAY_ID,
      STORAGE_PASSWORD_RESET_ENDS_AT_ID
    ]);
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
