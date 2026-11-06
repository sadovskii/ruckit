import { BlackListData } from "../black-list-models";
import { matchesKeywordOrPhrase } from "../common/keywords-and-phrases-matching";

const CHANNEL_RENDER_LOCAL_NAME = 'ytd-channel-renderer';

export function hideChannel(htmlElement: HTMLElement, data: BlackListData) {
    if (htmlElement.localName === CHANNEL_RENDER_LOCAL_NAME) {
        hideElementsFromBlackListByChannelName(htmlElement, data.blackListChannels);
        hideElementsFromBlackListByName(htmlElement, data.blackListKeywordsAndPhrases);
    }
}

function hideElementsFromBlackListByChannelName(channelElement: HTMLElement, blackListChannels: string[]) {
    var element = channelElement?.querySelector('#info-section #main-link') as HTMLElement;
    var channelLink = element?.getAttribute("href");

    if (channelLink) {
        blackListChannels.forEach(blackChannel => {
            if (channelLink?.startsWith(blackChannel, 1)) {
                channelElement.remove();
            }
        })
    }
}

function hideElementsFromBlackListByName(ytdVideoRenderer: HTMLElement, blackListKeywordsAndPhrases: string[]) {
    var element = ytdVideoRenderer?.querySelector('#info-section ytd-channel-name yt-formatted-string') as HTMLElement;
    var name = element?.textContent;

    if (matchesKeywordOrPhrase(name, blackListKeywordsAndPhrases)) {
        ytdVideoRenderer.remove();
    }
}