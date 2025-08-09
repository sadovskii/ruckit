import { runBlackListScriptsByUrl, runHideListCssScripts } from "./background-functionality";

const restrictedPage = 'https://www.youtube.com/-rp'


chrome.runtime.onInstalled.addListener(async (details) => {
    const reason = details.reason;
 
    switch (reason) {
        case 'install':
            console.log('New User installed the extension.');
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