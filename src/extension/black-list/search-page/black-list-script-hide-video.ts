import { BlackListData } from "../black-list-models";

const VIDEO_RENDER_LOCAL_NAME = 'ytd-video-renderer';

// hide ytd-video-renderer
export function hideVideos(htmlElement: HTMLElement, data: BlackListData) {
    if (htmlElement.localName === VIDEO_RENDER_LOCAL_NAME) {
        hideElementsFromBlackListByChannelName(htmlElement, data.blackListChannels);
        hideElementsFromBlackListByName(htmlElement, data.blackListWords);
        hideElementsFromBlackListByPhrase(htmlElement, data.blackListPhrases);
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

function hideElementsFromBlackListByName(ytdVideoRenderer: HTMLElement, blackListWords: string[]) {
    var element = ytdVideoRenderer?.querySelector('#video-title') as HTMLElement;
    var name = element?.getAttribute("title")?.toLowerCase();

    if (name) {
        const splited = name?.toLocaleLowerCase().split(' ');
        for (let i = 0; i < blackListWords.length; i++) {
            var result = splited?.some((w) => {
                return w.includes(blackListWords[i]?.toLocaleLowerCase())
            })

            if (result) {
                ytdVideoRenderer.remove();
                break;
            }
        }
    }
}

function hideElementsFromBlackListByPhrase(ytdVideoRenderer: HTMLElement, blackListPhrases: string[]) {
    var element = ytdVideoRenderer?.querySelector('#video-title') as HTMLElement;
    var name = element?.getAttribute("title")?.toLowerCase();

    for (let i = 0; i < blackListPhrases.length; i++) {
        var result = name?.includes(blackListPhrases[i])

        if (result) {
            ytdVideoRenderer.remove();
        }
    }
}