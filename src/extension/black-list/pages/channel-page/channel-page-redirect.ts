import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";
import { BlackListStorage } from "../../black-list-storage";


export class ChannelPageRedirect {
    constructor(public data: BlackListStorage) {}

    videoPageRedirect() {

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

        const splited = channelName?.toLocaleLowerCase().split(' ');
        for (let i = 0; i < this.data.keywords.length; i++) {
            var result = splited?.some((w) => {
                return w.includes(this.data.keywords[i]?.toLocaleLowerCase())
            })

            if (result) {
                this.replace(browse);
                console.log('test: replaced channel with channelName = ', channelName);
                return;
            }
        }

        for (let i = 0; i < this.data.phrases.length; i++) {
            var result = channelName?.includes(this.data.phrases[i])
    
            if (result) {
                this.replace(browse);
                console.log('test: replaced channel with channelName = ', channelName);
                return;
            }
        }
    }

    replace(browse: Element) {
        chrome.runtime.sendMessage({restrictedPage: true});
    }
}
