import { Injectable } from '@angular/core';
import { expand, filter, map, Observable, of, switchMap, takeWhile, timer } from 'rxjs';
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
// how often to look for a reset started in another window when none is pending here
const IDLE_CHECK_INTERVAL_MS = 30 * 1000;
// wake up just after the end time, not just before it
const AFTER_END_MARGIN_MS = 50;

export type PasswordResetState =
  | { status: 'none' }
  | { status: 'pending', endsAt: number, remainingMs: number }
  // the delay is over and the password has just been removed
  | { status: 'completed' };

// A reset is a delayed, cancellable removal of the password: "start" saves the end time,
// and the password is removed the first time the UI looks at it after that time (an open page looks at it
// through watchExpiry, so it does not have to wait for a click).
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

  // Removes the password at the moment a started reset ends while the page stays open, so nobody has to click
  // "Enter password" to find out. Emits every time it removed the password; never ends.
  // It sleeps until the end time. With no reset pending it wakes up every 30 seconds, so a reset started in
  // another window is picked up too.
  watchExpiry(): Observable<void> {
    return this._checkExpiry().pipe(
      expand(check => timer(check.nextCheckInMs).pipe(switchMap(() => this._checkExpiry()))),
      filter(check => check.completed),
      map(() => undefined)
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

  private _checkExpiry(): Observable<{ completed: boolean, nextCheckInMs: number }> {
    return this.finalizeIfExpired().pipe(
      switchMap(completed => this.getState().pipe(
        map(state => ({
          completed,
          nextCheckInMs: state.status === 'pending'
            ? Math.min(IDLE_CHECK_INTERVAL_MS, state.remainingMs + AFTER_END_MARGIN_MS)
            : IDLE_CHECK_INTERVAL_MS
        }))
      ))
    );
  }

  private _toState(endsAt: unknown): PasswordResetState {
    if (typeof endsAt !== 'number') {
      return { status: 'none' };
    }

    return { status: 'pending', endsAt, remainingMs: Math.max(0, endsAt - Date.now()) };
  }
}
