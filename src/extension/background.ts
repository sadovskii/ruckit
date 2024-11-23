import { EXTENSION_IDENTIFIER, HIDE_LIST_ID } from "src/app/shared/constants";
import { BlackListStorage } from "./black-list/black-list-storage";
import { ChromeService } from "src/app/shared/services/chrome/chrome.service";
import { HideListItemType } from "src/app/settings/layout-content/hide-list/hide-list.models";
import { HideListModelConfiguration } from "src/app/settings/layout-content/hide-list/hide-list.configuration";
import { combineLatest, concat, concatAll, delay, forkJoin, from, merge, Observable, of } from "rxjs";

const youtube = 'https://www.youtube.com/'
const search = 'https://www.youtube.com/results'

console.log("background works test 1111! constant = ", EXTENSION_IDENTIFIER);


chrome.runtime.onInstalled.addListener(async (details) => {
    const reason = details.reason;
 
    switch (reason) {
        case 'install':
            console.log('New User installed the extension.')
            break;
        case 'update':
            var chromeService = new ChromeService();

            var item = await chrome.storage.sync.get(HIDE_LIST_ID);
            var items = await chrome.scripting.getRegisteredContentScripts();
            console.log("all items = ", items);
            const map = item[HIDE_LIST_ID];

            if (map) {
                const hideListItemMap = new Map<HideListItemType, boolean>(map);
                const configuration = HideListModelConfiguration(hideListItemMap);
                const cssFiles: string[] = [];

                configuration.groups.forEach(g => {
                    g.items.forEach(item => {
                        if (item.value) {
                            cssFiles.push(item.cssUrl);
                        }
                    })
                })

                chromeService.addCssContentScriptOrUpdateExist(
                    HIDE_LIST_ID,
                    cssFiles
                ).subscribe();
            }
          break;
       case 'chrome_update':
       case 'shared_module_update':
       default:
          console.log('Other install events within the browser')
          break;
    }
 
 })

// chrome.tabs.onUpdated.addListener(async (tabActiveId, changeInfo, tab) => {
//     if (changeInfo.url) {
//         console.log('changeInfo = ', changeInfo);
//         if (tab.url && tab.url?.startsWith(youtube)) {
//             for (let i = 0; i < BlackListStorage.blackChannels.length; i++) {
//                 if (tab.url?.includes(BlackListStorage.blackChannels[i])) {
//                     await chrome.tabs.update({
//                         url: youtube
//                     })
//                 }
//             }
//         }
//     }

    
//     if (changeInfo.url) {
//         console.log('before reload', changeInfo);
//         if (tab.url && tab.url?.startsWith(search) && tab.id) {
//             setTimeout(() => {
//                 if (tab.id) {
//                     chrome.tabs.reload(tab.id);
//                 }
                
//             }, 1000)
//         }
//     }
// })
