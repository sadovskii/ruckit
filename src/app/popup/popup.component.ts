import { Component } from '@angular/core';
import { GlobalService, Page } from '../services/global/global.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  constructor(private _globalService: GlobalService) {}

  async onRouteToMainPage() {
    console.log("onRouteToMainPage");




    let queryOptions = { url: 'chrome-extension://angndinolnfailiohlpgnpcjmffkfhjh/index.html' };
    let tabs: chrome.tabs.Tab[] = await chrome.tabs.query(queryOptions);

    console.log("tabs ", tabs);
    console.log("chrome ", chrome);
    console.log("chrome.tabs ", chrome.tabs);
    console.log("chrome.tabs current ", await chrome.tabs.getCurrent());
    if (tabs && tabs.length > 0) {
        var updateProperties = { 'active': true };
        if (tabs[0].id) {
            chrome.tabs.update(tabs[0].id, updateProperties, (tab) => { });
        }
    }
    else {
        let tab1 = chrome.tabs.create({
            url: 'index.html',
          });
    }

    this._globalService.page = Page.Settings;
  }

  async onCheckPopup() {
    console.log("window ", await chrome.windows.getCurrent());
    console.log("chrome.tabs current ", await chrome.tabs.getCurrent());
  }
}
