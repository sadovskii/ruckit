import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_PHRASES, STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON } from "src/app/shared/constants";
import { hideElement } from "./black-list-script-manipulations";
import { BlackListData } from "../black-list-models";
import { getFirstYtdItemMutation, getYtdItemMutation, getYtdListMutation } from "./black-list-script-mutations";
import { getBlackListData } from "../common/common-functionality";

let data: BlackListData = {
    blackListChannels: [],
    blackListWords: [],
    blackListPhrases: []
}

// counter is 1 because it's needed run code immediately
let counter = 1;
let timeout = setTimeout(async function page() {
    // the important thing that there are two contents.
    // first is inside ytd-section-list-renderer
    // second is inside ytd-item-section-renderer
    const listContent = Array.from(document.querySelectorAll("ytd-search ytd-section-list-renderer #contents.ytd-section-list-renderer") as NodeListOf<HTMLElement>)[0];
    // need to work with first item separately because loading content to this item is unique
    // it expresses when making search without reload while one search has already beed made
    const firstItem = Array.from(document.querySelectorAll("ytd-search ytd-item-section-renderer") as NodeListOf<HTMLElement>)[0];

    // if content is null it means that it hasn't been loaded yet and need to try again after 500 ms
    if (listContent && firstItem) {
        data = await getBlackListData();

        console.log('test: data = ', data);

        if ((window as any).subMutationObserver) {
            (window as any).subMutationObserver.disconnect();
        }

        (window as any).subMutationObserver = getYtdItemMutation(data);
    
        if ((window as any).mutationObserver) {
            (window as any).mutationObserver.disconnect();
        }

        (window as any).mutationObserver = getYtdListMutation(data, (window as any).subMutationObserver);

        if ((window as any).firstMutationObserver) {
            (window as any).firstMutationObserver.disconnect();
        }

        (window as any).firstMutationObserver = getFirstYtdItemMutation(data, data.blackListChannels);

        if (firstItem) {
            // need to run this observe for first ytd-item-section-renderer
            // it solves situation when ytd-item-section-renderer is rendered. some videos inside are rendered too
            // but not all
            // these videos can be catched this observe
            (window as any).firstMutationObserver.observe(firstItem, {
                attributes: true,
                attributeOldValue: true
            });
        }

        // taking all direct children
        // I used children and childNotes at first but these properties gave ald children
        const firstItemContentsItems = firstItem.querySelectorAll("#contents > *");

        if (firstItemContentsItems) {
            firstItemContentsItems.forEach(child => {
                const htmlElement = child as HTMLElement;
                hideElement(htmlElement, data);
            })
        }

        // observe ytd-section-list-renderer for ytd-item-section-renderer that will be able to be rendered
        (window as any).mutationObserver.observe(listContent, {
            childList: true,
        });

        // when code is run there is no need to run code again
        clearTimeout(timeout);
        return;
    }
    else {
        counter = 500;
    }

    timeout = setTimeout(page, counter);
}, counter)