import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, map, Observable, Subject } from 'rxjs';
export {}

@Injectable({ providedIn: 'root' })
export class GlobalService {
  public page: Page = Page.Popup
  public password = new BehaviorSubject<string | undefined>(undefined);
  public isRestricted = new BehaviorSubject<boolean>(false);

  private _isRestricted$ = new BehaviorSubject<Restriction>({ hasPassword: false, isPasswordFreeSession: false });
  private _isPasswordFreeSessionSwitched$ = new Subject<void>();

  setIsPasswordFreeSession$(value: boolean) {
    const hasPassword = this._isRestricted$.value.hasPassword;

    if (value) {
      this._isPasswordFreeSessionSwitched$.next();
    }

    this._isRestricted$.next({
      hasPassword: hasPassword,
      isPasswordFreeSession: value
    });
  }

  setHasPassword$(value: boolean) {
    let isPasswordFreeSessionLocal = this._isRestricted$.value.isPasswordFreeSession;

    if (!value) {
      isPasswordFreeSessionLocal = false;
    }

    this._isRestricted$.next({
      hasPassword: value,
      isPasswordFreeSession: isPasswordFreeSessionLocal
    });
  }

  get getIsRestricted$(): Observable<boolean> {
    return this._isRestricted$.asObservable().pipe(
      map(p => {

        if (p.hasPassword) {
          return !p.isPasswordFreeSession;
        }

        return p.hasPassword;
      })
    )
  }

  getIsRestrictedValue(): boolean {
    const object = this._isRestricted$.value;

    if (object.hasPassword) {
      return !object.isPasswordFreeSession;
    }

    return object.hasPassword;
  }

  getHasPassword$(): Observable<boolean> {
    return this._isRestricted$.asObservable().pipe(
      map(p => {
        return p.hasPassword;
      })
    )
  }

  getIsPasswordFreeSessionSwitched$(): Observable<void> {
    return this._isPasswordFreeSessionSwitched$.asObservable();
  }
}

interface Restriction {
  hasPassword: boolean;
  isPasswordFreeSession: boolean;
}

export enum Page {
  Popup,
  Settings
}
