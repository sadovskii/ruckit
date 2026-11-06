import { BlackListStorage } from "../../black-list-storage";

export class VideoPageRedirect {
    constructor(public data: BlackListStorage) {}

    videoPageRedirect() {
        const watchFlexy = document.querySelector('ytd-page-manager > ytd-watch-flexy');

        if (!watchFlexy) return;
    
        const title = watchFlexy.querySelector('ytd-watch-metadata #title yt-formatted-string');
        const channelLink = watchFlexy.querySelector('ytd-watch-metadata ytd-video-owner-renderer ytd-channel-name yt-formatted-string a');
    
        const videoName = title?.textContent?.trim();
        let channelName = channelLink?.textContent?.trim();
    
        if (videoName && channelName) {
            if (channelName.length > 60) {
                channelName = channelName.substring(0, 60);
            }

            if (this.data.channelIsTurnedOn) {
                if (this.data.channelMap.has(channelName)) {
                    this.replace();
                    return;
                }
            }
            
            if (this.data.keywordsAndPhrasesIsTurnedOn && this.data.matchesKeywordOrPhrase(videoName)) {
                this.replace();
                return;
            }
        }
    }

    replace() {
        chrome.runtime.sendMessage({restrictedPage: true});
    }
}