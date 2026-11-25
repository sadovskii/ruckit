import { Component, OnDestroy, OnInit } from '@angular/core';
import { GlobalService, Page } from './shared/services/global/global.service';
import { debounce, debounceTime, from, map, Observable, of, Subscription, switchMap, tap, timer } from 'rxjs';
import { ChromeService } from './shared/services/chrome/chrome.service';
import { IconRegisterService } from './shared/services/nbIcon-library-register.service';
import { STORAGE_FREE_PASSWORD_PERIOD_ID, STORAGE_PASSWORD_ID, STORAGE_THEME_ID } from './shared/constants';
import { NbThemeService } from '@nebular/theme';
import { PasswordResetService } from './settings/layout-content/password/password-reset.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  
  public Page = Page;
  public page: Page = Page.Popup;
  public currentTab$: Observable<chrome.tabs.Tab | undefined>; 

  private _subscription = new Subscription();

  constructor(
    private _chromeService: ChromeService,
    private _registerIconService: IconRegisterService,
    private _globalService: GlobalService,
    private _themeService: NbThemeService,
    private _passwordResetService: PasswordResetService
  ) {}

  ngOnInit() {
    this.currentTab$ = this._chromeService.getCurrentTab();
    this.initIsRestricted()
    this.initTheme();
    this.initIsPasswordFreeSessionSwitched();
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  initIsRestricted() {
    // a reset that ended while the extension was closed removes the password before it is read
    this._passwordResetService.finalizeIfExpired().pipe(
      switchMap(() => this._chromeService.storageSyncGetItem(STORAGE_PASSWORD_ID))
    ).subscribe(password => {
      if (password) {
        this._globalService.setHasPassword$(true);
      }
      else {
        this._globalService.setHasPassword$(false);
      }
    })

    // a reset that ends while the page is open unlocks it at once (finalizing tells the rest of the page)
    this._subscription.add(this._passwordResetService.watchExpiry().subscribe());
  }

  initTheme() {
    this._chromeService.storageSyncGetItem(STORAGE_THEME_ID).subscribe(theme => {
      if (theme) {
        console.log("theme = ", theme);
        this._themeService.changeTheme(theme);
      }
    })
  }

  initIsPasswordFreeSessionSwitched() {
    this._globalService.getIsPasswordFreeSessionSwitched$().pipe(
      switchMap(_ => this._chromeService.storageSyncGetItem(STORAGE_FREE_PASSWORD_PERIOD_ID)),
      debounce(period => {
        console.log('debounce')
        if (period) {
          const number = +period;
          
          return timer(number * 1000);
        }
        else {
          return timer(30000);
        }
      })
    ).subscribe(period => {
      console.log('debounce is finished')
      this._globalService.setIsPasswordFreeSession$(false)
    })
  }

  title = 'df-youtube-angular';
}