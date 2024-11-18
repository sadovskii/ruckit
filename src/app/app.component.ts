import { Component, OnInit } from '@angular/core';
import { GlobalService, Page } from './shared/services/global/global.service';
import { from, Observable, of } from 'rxjs';
import { ChromeService } from './shared/services/chrome/chrome.service';
import { IconRegisterService } from './shared/services/nbIcon-library-register.service';

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
    private _registerIconService: IconRegisterService
  ) {}

  ngOnInit() {
    console.log("ngOnInit app component");
    this.currentTab$ = this._chromeService.getCurrentTab();
    this.currentTab$.subscribe(t => {
      console.log("currentTab$ = ", t);
    })
  }

  title = 'df-youtube-angular';
}
// await chrome.tabs.getCurrent()Ы