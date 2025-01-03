import { Injectable } from '@angular/core';
import { delay, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { EXTENSION_IDENTIFIER } from '../../constants';

@Injectable()
export class ChromeService {
  getCurrentTab(): Observable<chrome.tabs.Tab | undefined> {
    return from(chrome.tabs.getCurrent())
  }

  async openIndexToNewTab() {
    let queryOptions = { url: `chrome-extension://${EXTENSION_IDENTIFIER}/index.html` };
    let tabs: chrome.tabs.Tab[] = await chrome.tabs.query(queryOptions);
  
    if (tabs && tabs.length > 1) {
      const tabIds = tabs.map(t => t.id).filter(t => t !== undefined);

      tabIds.shift();
      await chrome.tabs.remove(tabIds as number[]);
    }

    if (tabs && tabs.length > 0) {
        let tab = tabs[0];
        let window = await chrome.windows.get(tab.windowId);
        
        if (window.focused === false) {
          chrome.windows.update(tab.windowId, { focused: true });
        }

        if (tab.id) {
            chrome.tabs.update(tab.id, { active: true }, (tab) => { });
        }
    }
    else {
        let tab1 = chrome.tabs.create({
            url: 'index.html',
          });
    }
  }

  scriptingGetRegisteredContentScripts(contentScriptId: string): Observable<chrome.scripting.RegisteredContentScript[]> {
    return from(chrome.scripting.getRegisteredContentScripts({ ids: [contentScriptId] }))
  }

  addCssContentScriptOrUpdateExist(contentScriptId: string, cssFiles: string[]): Observable<any> {
    return this.scriptingGetRegisteredContentScripts(contentScriptId).pipe(
      switchMap(t => {
        if (t.length > 0) {

          cssFiles.forEach(cssFile => {
            if (!t[0].css?.find(q => q === cssFile)) {
              t[0].css?.push(cssFile);
            }
          });
          return from(chrome.scripting.updateContentScripts([t[0]]));
        }
        else {
          return from(chrome.scripting.registerContentScripts([{
            id: contentScriptId,
            css: [...cssFiles, "styles/blank.css"],
            matches: ["*://www.youtube.com/*"],
            runAt: "document_start"
          }]));
        }
      })
    );
  }

  removeCssContentScript(contentScriptId: string, cssFile: string): Observable<any> {
    return from(chrome.scripting.getRegisteredContentScripts({ ids: [contentScriptId] })).pipe(
      switchMap(t => {
        if (t.length > 0) {

          t[0].css = t[0].css?.filter(t => t !== cssFile);

          return from(chrome.scripting.updateContentScripts([t[0]]));
        }
        else {
          return of(null);
        }
      })
    );
  }

  insertCssToYoutube(cssUrl: string) {
    chrome.tabs.query({ "url": "*://www.youtube.com/*"}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          of(chrome.scripting.insertCSS({
            target: {
              tabId: tab.id,
            },
            files: [cssUrl],
          })).subscribe();
        } 
      })
    })
  }

  removeCssToYoutube(cssUrl: string) {
    chrome.tabs.query({ "url": "*://www.youtube.com/*"}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          of(chrome.scripting.removeCSS({
            target: {
              tabId: tab.id,
            },
            files: [cssUrl],
          })).subscribe();
        } 
      })
    })
  }

  storageSyncGetItem(key: string): Observable<any> {
    return from(chrome.storage.sync.get(key))
      .pipe(map(value => value[key]));
  }

  storageSyncGetItems(keys: string[]): Observable<any> {
    return from(chrome.storage.sync.get(keys));
  }

  storageSyncSet<T>(key: string, value: T) {
    let data: { [key: string]: T } = {};
    data[key] = value;
    return from(chrome.storage.sync.set(data))
  }

  storageSyncSetMap(key: string, map: Map<any, any>): Observable<void> {
    let data: { [key: string]: any } = {};
    data[key] = Array.from(map);
    return from(chrome.storage.sync.set(data));
  };

  storageSyncGetBytesInUse(key: string) {
    from(chrome.storage.sync.getBytesInUse(key)).subscribe(t => {
      console.log(`${key} size = `, t);
    })
  }

  storageSyncRemove(key: string): Observable<void> {
    return from(chrome.storage.sync.remove(key))
  }
}
