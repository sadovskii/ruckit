import { HidelistCssConfiguration } from "src/app/settings/layout-content/hide-list/hide-list.configuration";
import { HideListItemType } from "src/app/settings/layout-content/hide-list/hide-list.models";
import { HIDE_LIST_ID } from "src/app/shared/constants";

const YOUTUBE = 'https://www.youtube.com/';
const SEARCH = 'https://www.youtube.com/results';

const CHANNEL_URL_AT = 'www.youtube.com/@';
const CHANNEL_URL_CHANNEL = 'www.youtube.com/channel/';
const CHANNEL_URL_USER = 'www.youtube.com/user/';
const CHANNEL_URL_C = 'www.youtube.com/c/'

const VIDEO_URL = 'www.youtube.com/watch';
const RESTRICTED_PAGE = 'https://www.youtube.com/-rp'

export function runBlackListScriptsByUrl(tab: chrome.tabs.Tab) {
    if (tab && tab.id && tab.url?.startsWith(YOUTUBE)) {
        if (tab.url?.startsWith(SEARCH)) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["black-list/search-page/black-list-search-page.js"]
            });
        }
    
        if (tab.url?.includes(CHANNEL_URL_CHANNEL) ||
            tab.url?.includes(CHANNEL_URL_AT) ||
            tab.url?.includes(CHANNEL_URL_USER) ||
            tab.url?.includes(CHANNEL_URL_C)) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["black-list/channel/black-list-channel.js"]
            });
        }
    
        if (tab.url?.includes(VIDEO_URL)) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["black-list/video/black-list-video.js"]
            });
        }
    
        if (tab.url === RESTRICTED_PAGE) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["black-list/common/black-list-remove-prohibitive-element.js"]
            });
        }
    }
}

export async function runHideListCssScripts(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
    const hidelist = await chrome.storage.sync.get(HIDE_LIST_ID);
    const hidelistMapped = hidelist[HIDE_LIST_ID];

    if (hidelistMapped && Array.isArray(hidelistMapped)) {
        const keys = Array.from(hidelistMapped)
            .filter(t => t[1])
            .map<HideListItemType>(t => t[0])
            .map(t => HidelistCssConfiguration[t]);

        if (keys && keys.length > 0) {
            await chrome.scripting.insertCSS({
                target: { tabId: details.tabId },
                files: keys
            })
        }
    }
}