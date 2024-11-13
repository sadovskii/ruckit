import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalService {
  public page: Page = Page.Popup
}


export enum Page {
  Popup,
  Settings
}
