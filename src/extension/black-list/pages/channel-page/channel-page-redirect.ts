import { BlackListStorage } from "../../black-list-storage";


export class ChannelPageRedirect {
    constructor(public data: BlackListStorage) {}

    channelPageRedirect() {

        if (!this.data.channelIsTurnedOn) return;

        const browse = document.querySelector('ytd-page-manager ytd-browse[page-subtype="channels"][role="main"]');

        if (!browse) return;

        let channelName = browse.querySelector('yt-page-header-renderer yt-dynamic-text-view-model h1 span')?.textContent;

        if (!channelName) return; 
        
        if (channelName.length > 60) {
            channelName = channelName.substring(0, 60);
        }

        if (this.data.channelMap.has(channelName)) {
                this.replace(browse);
                return;
            }

        // keywords and phrases are checked regardless of their toggle here (pre-existing behavior)
        if (this.data.matchesKeywordOrPhrase(channelName)) {
            this.replace(browse);
            return;
        }
    }

    replace(browse: Element) {
        chrome.runtime.sendMessage({restrictedPage: true});
    }
}
