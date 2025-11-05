import { HideListItemType } from "src/app/settings/layout-content/hide-list/hide-list.models";
import { runBlackListScriptsByUrl, runHideListCssScripts } from "./background-functionality";
import { HideListStorage } from "./hide-list/hide-list-storage";
import { BlackListStorage } from "./black-list/black-list-storage";
import { BlackListRestrictionType } from "src/app/settings/layout-content/black-list/black-list.models";

const restrictedPage = 'https://www.youtube.com/-rp'


chrome.runtime.onInstalled.addListener(async (details) => {
    const reason = details.reason;

    switch (reason) {
        case 'install':
            console.log('New User installed the extension.');
            const blackListData = new BlackListStorage();
            await blackListData.init();
            await blackListData.setBlackListTutnedOn(true, BlackListRestrictionType.Channels);

            blackListData.initHandler();

            const hidelistData = new HideListStorage();
            await hidelistData.init();
            await hidelistData.addHideListItem(HideListItemType.GeneralHideShorts);

            chrome.tabs.query({ "url": "*://www.youtube.com/*"}, function(tabs) {
                tabs.forEach(tab => {
                    if (tab?.id) {
                        chrome.tabs.reload(tab.id);
                    }
                });
            });

            break;
        case 'update':
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
    if (details.frameId === 0 && details.url.includes('www.youtube.com')) {
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
    if (request.blackListBecomeWeaker) {
        chrome.tabs.query({ "url": "*://www.youtube.com/*"}, function(tabs) {
            tabs.forEach(tab => {
                if (tab?.id) {
                    chrome.tabs.reload(tab.id);
                }
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