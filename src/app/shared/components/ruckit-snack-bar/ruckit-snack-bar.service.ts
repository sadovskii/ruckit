import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable, shareReplay, Subject, timeout } from 'rxjs';
import { t } from '../../i18n/i18n';

@Injectable()
export class RuckitSnackBarService {

  private snackbar: Snackbar | undefined = undefined;
  private snackbarSubject = new BehaviorSubject<Snackbar | undefined>(undefined);
  snackbar$ = this.snackbarSubject.asObservable();
  private _action$ = new Subject<SnackbarActionType>();

  constructor() { }

  private show(message: string, type: SnackbarType, action: SnackbarActionType) {
    const id = Date.now();
    this.snackbar = { id, message, type, action, isShown: true };
    this.snackbarSubject.next(this.snackbar);
    this._action$ = new Subject<SnackbarActionType>();
    return id;
  }

  remove() {
    this.snackbar = undefined
    this.snackbarSubject.next(undefined);
  }

  success(action: SnackbarActionType = SnackbarActionType.undo) {
    const message = t('snackbar_setting_edited');
    console.log('action = ', action);
    this.show(message, SnackbarType.success, action);
  }

  restricted(action: SnackbarActionType = SnackbarActionType.enterPassword) {
    const message = t('snackbar_editing_restricted');
    this.show(message, SnackbarType.restricted, action);
  }

  get action$() {
    return this._action$.asObservable();
  }

  action(actionType: SnackbarActionType) {
    console.log('action');
    this._action$.next(actionType);
  }

  get isShown() {
    return this.snackbar !== undefined;
  } 
}

export interface Snackbar {
  id: number;
  message: string;
  type: SnackbarType;
  action: SnackbarActionType;
  isShown: boolean;
}

export enum SnackbarType {
  success,
  restricted
}

export enum SnackbarActionType {
  undefined = -1,
  enterPassword = 'enterPassword',
  undo = 'undo'
}

export const snackbarActionTypeToMessageKey: Record<SnackbarActionType, string> = {
  [SnackbarActionType.undefined]: '',
  [SnackbarActionType.enterPassword]: 'snackbar_action_enter_password',
  [SnackbarActionType.undo]: 'snackbar_action_undo'
};
