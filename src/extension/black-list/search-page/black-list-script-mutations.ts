import { BlackListData } from "../black-list-models";
import { hideElement } from "./black-list-script-manipulations";

// mutation observer for ytd-item-section-renderer that are inside ytd-section-list-renderer
export function getYtdListMutation(blackListData: BlackListData, ytdItemMutaion: MutationObserver): MutationObserver {
     return new MutationObserver(async (entry) => {
        entry?.forEach(element => {
            element.addedNodes?.forEach(node => {
                // find ytd-item-section-renderer because there is also ytd-continuation-item-renderer spinner
                if (node.nodeName.toLowerCase() === "ytd-item-section-renderer") {
                    const htmlItemSection = node as HTMLElement;

                    // taking all direct children
                    // I used children and childNotes at first but these properties gave ald children
                    const firstItemContentsItems = htmlItemSection?.querySelectorAll('#contents > *');

                    if (firstItemContentsItems) {
                        firstItemContentsItems.forEach(item => {
                            const htmlElement = item as HTMLElement;
                            hideElement(htmlElement, blackListData);
                        });
                    }

                    // observe ytd-item-section-renderer for elements that will be rendered
                    // finding item with id contents
                    node.childNodes.forEach(element => {
                        const html = element as HTMLElement
                        if (html.id === "contents") {
                            ytdItemMutaion.observe(html, { childList: true });
                        }
                    });
                }
            });
        });
    })
}

// mutation observer for elements that are inside ytd-item-section-renderer
export function getYtdItemMutation(blackListData: BlackListData): MutationObserver {
    return new MutationObserver(async (entry) => {
        entry?.forEach(element => {
            element.addedNodes?.forEach(node => {
                const html = node as HTMLElement;
                hideElement(html, blackListData);
            });
        });
    })
}

// mutation observer for elements that are inside first ytd-item-section-renderer
// this mutation works with attribute can-show-more
export function getFirstYtdItemMutation(blackListData: BlackListData, blackListChannels: string[]): MutationObserver {
    return new MutationObserver(async (entry) => {
        entry.forEach(e => {
            // when oldValue is '' it means that attribute can-show-more is removed
            // and it means that rendering of first ytd-item-section-renderer is finished
            if (e.attributeName === 'can-show-more' && e.oldValue == '') {
                const firstItem = e.target as HTMLElement;

                // taking all direct children
                // I used children and childNotes at first but these properties gave ald children
                const firstItemContentsItems = firstItem?.querySelectorAll('#contents > *');

                if (firstItemContentsItems) {
                    firstItemContentsItems.forEach(item => {
                        const htmlElement = item as HTMLElement;
                        hideElement(htmlElement, blackListData);
                    });
                }
            }
        })
    })
}