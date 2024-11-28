import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalService {
  public page: Page = Page.Popup
  public password = new BehaviorSubject<string | undefined>(undefined);
  public isRestricted = new BehaviorSubject<boolean>(false);
}


export enum Page {
  Popup,
  Settings
}
