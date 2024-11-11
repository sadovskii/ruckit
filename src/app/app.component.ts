import { Component, OnInit } from '@angular/core';
import { GlobalService, Page } from './services/global/global.service';
import { from, Observable, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  public Page = Page;
  public page: Page = Page.Popup;
  public currentTab$: Observable<chrome.tabs.Tab | undefined> = from(chrome.tabs.getCurrent()); 

  constructor(public _pageService: GlobalService) {
  }

  ngOnInit() {
    this.currentTab$ = from(chrome.tabs.getCurrent())
    console.log("page = ", this._pageService.page);
    this._pageService.page = Page.Popup;
    console.log("ngOnInit app component");

    this.currentTab$.subscribe(t => {
      console.log("currentTab$ = ", t);
    })
  }

  title = 'df-youtube-angular';
}
// await chrome.tabs.getCurrent()Ы