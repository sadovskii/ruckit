import { BlackListData } from "../black-list-models";
import { matchesKeywordOrPhrase } from "../common/keywords-and-phrases-matching";

const VIDEO_RENDER_LOCAL_NAME = 'ytd-video-renderer';

// hide ytd-video-renderer
export function hideVideos(htmlElement: HTMLElement, data: BlackListData) {
    if (htmlElement.localName === VIDEO_RENDER_LOCAL_NAME) {
        hideElementsFromBlackListByChannelName(htmlElement, data.blackListChannels);
        hideElementsFromBlackListByName(htmlElement, data.blackListKeywordsAndPhrases);
    }
}

function hideElementsFromBlackListByChannelName(ytdVideoRenderer: HTMLElement, blackListChannels: string[]) {
    var element = ytdVideoRenderer?.querySelector('#channel-thumbnail') as HTMLElement;
    var channelLink = element?.getAttribute("href");

    if (channelLink) {
        blackListChannels.forEach(blackChannel => {
            // start with from 1 because always in href value is /@something
            if (channelLink?.startsWith(blackChannel, 1)) {
                ytdVideoRenderer.remove();
            }
        })
    }
}

function hideElementsFromBlackListByName(ytdVideoRenderer: HTMLElement, blackListKeywordsAndPhrases: string[]) {
    var element = ytdVideoRenderer?.querySelector('#video-title') as HTMLElement;
    var name = element?.getAttribute("title");

    if (matchesKeywordOrPhrase(name, blackListKeywordsAndPhrases)) {
        ytdVideoRenderer.remove();
    }
}