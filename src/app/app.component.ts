import { Component, OnInit } from '@angular/core';
import { GlobalService, Page } from './shared/services/global/global.service';
import { from, Observable, of } from 'rxjs';
import { ChromeService } from './shared/services/chrome/chrome.service';
import { IconRegisterService } from './shared/services/nbIcon-library-register.service';
import { STORAGE_PASSWORD_ID, STORAGE_THEME_ID } from './shared/constants';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  public Page = Page;
  public page: Page = Page.Popup;
  public currentTab$: Observable<chrome.tabs.Tab | undefined>; 

  constructor(
    private _chromeService: ChromeService,
    private _registerIconService: IconRegisterService,
    private _globalService: GlobalService,
    private _themeService: NbThemeService
  ) {}

  ngOnInit() {
    this.currentTab$ = this._chromeService.getCurrentTab();
    this.initIsRestricted()
    this.initTheme();
  }

  initIsRestricted() {
    this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_ID).subscribe(password => {
      if (password) {
        this._globalService.isRestricted.next(true);
      }
    })
  }

  initTheme() {
    this._chromeService.storageSyncGetItem(STORAGE_THEME_ID).subscribe(value => {
      const theme = value[STORAGE_THEME_ID];
      if (theme) {
        console.log("theme = ", theme);
        this._themeService.changeTheme(theme);
      }
    })
  }

  title = 'df-youtube-angular';
}