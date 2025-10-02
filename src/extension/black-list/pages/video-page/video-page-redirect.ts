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
            
            if (this.data.keywordsIsTurnedOn) {
                const splited = videoName.toLocaleLowerCase().split(' ');
                for (let i = 0; i < this.data.keywords.length; i++) {
                    var result = splited?.some((w) => {
                        return w.includes(this.data.keywords[i]?.toLocaleLowerCase())
                    })
        
                    if (result) {
                        this.replace();
                        return;
                    }
                }
            }
            if (this.data.phrasesIsTurnedOn) {
                for (let i = 0; i < this.data.phrases.length; i++) {
                    var result = videoName?.includes(this.data.phrases[i])
            
                    if (result) {
                        this.replace();
                        return;
                    }
                }
            }
        }
    }

    replace() {
        chrome.runtime.sendMessage({restrictedPage: true});
    }
}