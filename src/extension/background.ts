import { HideListItemType } from "src/app/settings/layout-content/hide-list/hide-list.models";
import { runBlackListScriptsByUrl, runHideListCssScripts } from "./background-functionality";
import { HideListStorage } from "./hide-list/hide-list-storage";

const restrictedPage = 'https://www.youtube.com/-rp'


chrome.runtime.onInstalled.addListener(async (details) => {
    const reason = details.reason;

    switch (reason) {
        case 'install':
            console.log('New User installed the extension.');
            break;
        case 'update':
            const hideListData = new HideListStorage();
            hideListData.init(); 
            var shorts = Array.from(hideListData.hideListMap)
                                .filter(t => t[1])
                                .map<HideListItemType>(t => t[0]);
    
            const shortTypes = new Set([
                HideListItemType.ShortsPageShortsSection,
                HideListItemType.SidebarShortsTab,
                HideListItemType.ChannelPageShortsTab,
                HideListItemType.SearchResultsShortsShelf,
                HideListItemType.SearchResultsSingleShorts]);
    
            const isShorts = shorts.some(a => shortTypes.has(a));
    
            if (isShorts && !hideListData.generalShorts) {
                await hideListData.addHideListItem(HideListItemType.GeneralHideShorts);
            }
            break;
       case 'chrome_update':
       case 'shared_module_update':
       default:
            console.log('Other install events within the browser')
            break;
    }
 
})

chrome.webNavigation.onCommitted.addListener(async (details) => {
    // frameId == 0 means that there was reload or move to new site
    if (details.frameId === 0 && details.url.includes('youtube.com')) {
        runHideListCssScripts(details);
    }
  });

chrome.tabs.onUpdated.addListener(async (tabActiveId, changeInfo, tab) => {
    // I use complete because i need event when user makes new search
    if (changeInfo.status === "complete") {
        runBlackListScriptsByUrl(tab);
    }
})


chrome.runtime.onMessage.addListener((request, sender) => {
    if (sender.tab && sender.tab.id && request.restrictedPage) {
        chrome.tabs.update(sender.tab.id, {url: restrictedPage});
    }
});


chrome.runtime.onMessage.addListener((request, sender) => {
    if (request.changeBlackList) {
        chrome.tabs.query({ "url": "*://www.youtube.com/*"}, function(tabs) {
            tabs.forEach(tab => {
                runBlackListScriptsByUrl(tab);
            });
        });
    }
})

checkSyncStorage();
checkSyncStorageUsage();

function checkSyncStorage() {
    chrome.storage.sync.getBytesInUse(null, (bytesInUse) => {
        const quota = chrome.storage.sync.QUOTA_BYTES;
        const freeBytes = quota - bytesInUse;
        
        console.log(`Used: ${bytesInUse} bytes`);
        console.log(`Free: ${freeBytes} bytes`);
    });
}

function checkSyncStorageUsage() {
  chrome.storage.sync.get(null, (items) => {
    const quota = chrome.storage.sync.QUOTA_BYTES;
    const quotaPerItem = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;

    let totalBytes = 0;
    console.log("---- chrome.storage.sync contents ----");

    for (const [key, value] of Object.entries(items)) {
      const json = JSON.stringify(value);
      const bytes = new TextEncoder().encode(json).length;
      totalBytes += bytes;
      console.log(`Key: "${key}" | Size: ${bytes} bytes | Value:`, value);
    }

    chrome.storage.sync.getBytesInUse(null, (bytesInUse) => {
      const freeBytes = quota - bytesInUse;
      console.log("--------------------------------------");
      console.log(`Total stored items: ${Object.keys(items).length}`);
      console.log(`Reported bytes in use: ${bytesInUse}`);
      console.log(`Calculated bytes in use: ${totalBytes}`);
      console.log(`Quota: ${quota} bytes`);
      console.log(`Quota per item: ${quotaPerItem} bytes`);
      console.log(`Free space: ${freeBytes} bytes`);
    });
  });
}