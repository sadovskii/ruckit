import { HidelistCssConfiguration } from "src/app/settings/layout-content/hide-list/hide-list.configuration";
import { HideListItemType } from "src/app/settings/layout-content/hide-list/hide-list.models";
import { HIDE_LIST_ID } from "src/app/shared/constants";

const YOUTUBE = 'www.youtube.com';
const RESTRICTED_PAGE = 'https://www.youtube.com/-rp'

export function runBlackListScriptsByUrl(tab: chrome.tabs.Tab) {
    if (tab && tab.id && tab.url?.includes(YOUTUBE)) {    
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

        const keysNotNullabe = keys.filter(t => t != null) as string[];

        if (keys && keys.length > 0) {
            await chrome.scripting.insertCSS({
                target: { tabId: details.tabId },
                files: keysNotNullabe
            })
        }
    }
}