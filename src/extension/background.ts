import { EXTENSION_IDENTIFIER, HIDE_LIST_ID } from "src/app/shared/constants";
import { ChromeService } from "src/app/shared/services/chrome/chrome.service";
import { HideListItemType } from "src/app/settings/layout-content/hide-list/hide-list.models";
import { HideListModelConfiguration } from "src/app/settings/layout-content/hide-list/hide-list.configuration";

const youtube = 'https://www.youtube.com/';
const search = 'https://www.youtube.com/results';

const channelUrlAt = 'www.youtube.com/@';
const channelUrlChannel = 'www.youtube.com/channel/';
const channelUrlUser = 'www.youtube.com/user/';
const channelUrlC = 'www.youtube.com/c/'

const videoUrl = 'www.youtube.com/watch';
const videoUrlEmbed = 'www.youtube.com/embed';

const restrictedPage = 'https://www.youtube.com/-rp'

console.log("background works test 1111! constant = ", EXTENSION_IDENTIFIER);


chrome.runtime.onInstalled.addListener(async (details) => {
    const reason = details.reason;
 
    switch (reason) {
        case 'install':
            console.log('New User installed the extension.');
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

let coupleHappend = false;

chrome.tabs.onUpdated.addListener(async (tabActiveId, changeInfo, tab) => {
    // I use complete because i need event when user makes new search
    if (changeInfo.status === "complete" && tab && tab.id && tab.url?.startsWith(youtube)) {
        console.log('test: *** url = ', tab.url);

        if (tab.url?.startsWith(search)) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["black-list/search-page/black-list-search-page.js"]
            });
        }

        if (tab.url?.includes(channelUrlChannel) ||
            tab.url?.includes(channelUrlAt) ||
            tab.url?.includes(channelUrlUser) ||
            tab.url?.includes(channelUrlC)) {
            console.log('test: channel url with channel = ', tab.url);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["black-list/channel/black-list-channel.js"]
            });
        }

        if (tab.url?.includes(videoUrl)) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["black-list/video/black-list-video.js"]
            });
        }

        if (tab.url === restrictedPage) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["black-list/common/black-list-remove-prohibitive-element.js"]
            });
        }
    }
})


chrome.runtime.onMessage.addListener(function(request, sender) {
    if (sender.tab && sender.tab.id && request.restrictedPage) {
        chrome.tabs.update(sender.tab.id, {url: restrictedPage});
    }
});

// chrome.contextMenus.create({
//     id: 'parent',
//     title: 'Parent',
//     type: "normal",
//     contexts: ['action'],
// });

// chrome.contextMenus.onClicked.addListener((info, tab) => {
//     console.log('test: context menu info = ', info);
// });