import { HideListStorage } from "src/extension/hide-list/hide-list-storage";

export class ShortPageRedirect {
    constructor(public data: HideListStorage) {
    }

    channelPageRedirect() {
        const shorts = document.querySelector('ytd-shorts');

        if (!shorts) return;

        if (this.data.generalShorts) {
            this.replace()
        }
    }

    replace() {
        chrome.runtime.sendMessage({restrictedPage: true});
    }
}