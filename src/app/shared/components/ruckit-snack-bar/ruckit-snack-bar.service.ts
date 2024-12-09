import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class RuckitSnackBarService {

  private snackbar: Snackbar | undefined = undefined;
  private snackbarSubject = new BehaviorSubject<Snackbar | undefined>(undefined);
  snackbar$ = this.snackbarSubject.asObservable();
  private _action$ = new Subject<SnackbarActionType>();

  constructor() { }

  private show(message: string, type: SnackbarType, action: SnackbarActionType) {
    const id = Date.now();
    this.snackbar = { id, message, type, action };
    this.snackbarSubject.next(this.snackbar);
    setTimeout(() => {
      
    }, 3000);
    return id;
  }

  remove() {
    this.snackbar = undefined
    this.snackbarSubject.next(undefined);
  }

  success(action: SnackbarActionType = SnackbarActionType.undo) {
    const message = 'Setting is sucessfully edited';
    console.log('action = ', action);
    this.show(message, SnackbarType.success, action);
  }

  restricted(action: SnackbarActionType = SnackbarActionType.enterPassword) {
    const message = 'Editing is restricted';
    this.show(message, SnackbarType.restricted, action);
  }

  action$() {
    return this._action$.asObservable();
  }

  action(actionType: SnackbarActionType) {
    console.log('action');
    this._action$.next(actionType);
  }
}

export interface Snackbar {
  id: number;
  message: string;
  type: SnackbarType;
  action: SnackbarActionType;
}

export enum SnackbarType {
  success,
  restricted
}

export enum SnackbarActionType {
  undefined = -1,
  enterPassword = 'Enter password',
  undo = 'Undo'
}
