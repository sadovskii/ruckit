import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { EXTENSION_IDENTIFIER } from '../../constants';

@Injectable()
export class ChromeService {
  getCurrentTab(): Observable<chrome.tabs.Tab | undefined> {
    return from(chrome.tabs.getCurrent())
  }

  async openIndexToNewTab() {
    let queryOptions = { url: `chrome-extension://${EXTENSION_IDENTIFIER}/index.html` };
    let tabs: chrome.tabs.Tab[] = await chrome.tabs.query(queryOptions);
  
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
  }
}
