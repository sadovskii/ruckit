import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, map, Observable, Subject } from 'rxjs';
export {}

@Injectable({ providedIn: 'root' })
export class GlobalService {
  public page: Page = Page.Popup
  public password = new BehaviorSubject<string | undefined>(undefined);
  public isRestricted = new BehaviorSubject<boolean>(false);

  private _isRestricted$ = new BehaviorSubject<Restriction>({ hasPassword: false, isPasswordFreeSession: false });

  setIsPasswordFreeSession$(value: boolean) {
    const hasPassword = this._isRestricted$.value.hasPassword;

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

  getIsRestricted$(): Observable<boolean> {
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
}

interface Restriction {
  hasPassword: boolean;
  isPasswordFreeSession: boolean;
}

export enum Page {
  Popup,
  Settings
}
