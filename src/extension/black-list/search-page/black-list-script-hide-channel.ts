import { BlackListData } from "../black-list-models";

const CHANNEL_RENDER_LOCAL_NAME = 'ytd-channel-renderer';

export function hideChannel(htmlElement: HTMLElement, data: BlackListData) {
    if (htmlElement.localName === CHANNEL_RENDER_LOCAL_NAME) {
        hideElementsFromBlackListByChannelName(htmlElement, data.blackListChannels);
        hideElementsFromBlackListByName(htmlElement, data.blackListWords);
        hideElementsFromBlackListByPhrase(htmlElement, data.blackListPhrases);
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

function hideElementsFromBlackListByName(ytdVideoRenderer: HTMLElement, blackListWords: string[]) {
    var element = ytdVideoRenderer?.querySelector('#info-section ytd-channel-name yt-formatted-string') as HTMLElement;
    var name = element?.textContent;

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
    var element = ytdVideoRenderer?.querySelector('#info-section ytd-channel-name yt-formatted-string') as HTMLElement;
    var name = element?.textContent;

    for (let i = 0; i < blackListPhrases.length; i++) {
        var result = name?.includes(blackListPhrases[i])

        if (result) {
            ytdVideoRenderer.remove();
        }
    }
}