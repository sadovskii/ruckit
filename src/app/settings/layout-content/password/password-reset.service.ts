import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, takeWhile, timer } from 'rxjs';
import {
  DEFAULT_PASSWORD_RESET_DELAY_MINUTES,
  STORAGE_PASSWORD_ID,
  STORAGE_PASSWORD_RESET_DELAY_ID,
  STORAGE_PASSWORD_RESET_ENDS_AT_ID
} from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { GlobalService } from 'src/app/shared/services/global/global.service';

const MS_IN_MINUTE = 60 * 1000;
const WATCH_INTERVAL_MS = 1000;

export type PasswordResetState =
  | { status: 'none' }
  | { status: 'pending', endsAt: number, remainingMs: number }
  // the delay is over and the password has just been removed
  | { status: 'completed' };

// A reset is a delayed, cancellable removal of the password: "start" saves the end time,
// and the password is removed the first time the UI looks at it after that time.
@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  constructor(
    private _chromeService: ChromeService,
    private _globalService: GlobalService) {}

  getState(): Observable<PasswordResetState> {
    return this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_RESET_ENDS_AT_ID).pipe(
      map(endsAt => this._toState(endsAt))
    );
  }

  // Emits every second until the reset is over: "pending" while waiting, "completed" once (and then ends).
  // Emits "none" every second when no reset is pending, so a reset started in another window shows up too.
  watchState(): Observable<PasswordResetState> {
    return timer(0, WATCH_INTERVAL_MS).pipe(
      switchMap(() => this.finalizeIfExpired()),
      switchMap(isCompleted => isCompleted ? of<PasswordResetState>({ status: 'completed' }) : this.getState()),
      takeWhile(state => state.status !== 'completed', true)
    );
  }

  // the delay saved with the password; passwords saved before the reset feature have none
  getDelayMinutes(): Observable<number> {
    return this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_RESET_DELAY_ID).pipe(
      map(delayMinutes => delayMinutes ?? DEFAULT_PASSWORD_RESET_DELAY_MINUTES)
    );
  }

  start(): Observable<void> {
    return this.getDelayMinutes().pipe(
      switchMap(delayMinutes =>
        this._chromeService.storageSyncSet<number>(STORAGE_PASSWORD_RESET_ENDS_AT_ID, Date.now() + delayMinutes * MS_IN_MINUTE))
    );
  }

  cancel(): Observable<void> {
    return this._chromeService.storageSyncRemove(STORAGE_PASSWORD_RESET_ENDS_AT_ID);
  }

  // Removes the password if a started reset is over. Returns true when it did.
  finalizeIfExpired(): Observable<boolean> {
    return this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_RESET_ENDS_AT_ID).pipe(
      switchMap(endsAt => {
        if (typeof endsAt !== 'number' || endsAt > Date.now()) {
          return of(false);
        }

        return this._chromeService.storageSyncRemoveItems([
          STORAGE_PASSWORD_ID,
          STORAGE_PASSWORD_RESET_DELAY_ID,
          STORAGE_PASSWORD_RESET_ENDS_AT_ID
        ]).pipe(
          map(() => {
            this._globalService.setHasPassword$(false);
            return true;
          })
        );
      })
    );
  }

  private _toState(endsAt: unknown): PasswordResetState {
    if (typeof endsAt !== 'number') {
      return { status: 'none' };
    }

    return { status: 'pending', endsAt, remainingMs: Math.max(0, endsAt - Date.now()) };
  }
}
