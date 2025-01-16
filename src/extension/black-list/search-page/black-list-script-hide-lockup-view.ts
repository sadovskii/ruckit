import { BlackListData } from "../black-list-models";

const LOCKUP_VIEW_LOCAL_NAME = 'yt-lockup-view-model';

// hide Playlists
export function hideLocupView(htmlElement: HTMLElement, data: BlackListData) {
    if (htmlElement.localName === LOCKUP_VIEW_LOCAL_NAME) {
        hideElementsFromBlackListByChannelName(htmlElement, data.blackListChannels);
        hideElementsFromBlackListByName(htmlElement, data.blackListWords);
        hideElementsFromBlackListByPhrase(htmlElement, data.blackListPhrases);
    }
}

function hideElementsFromBlackListByChannelName(ytdVideoRenderer: HTMLElement, blackListChannels: string[]) {
    var element = ytdVideoRenderer?.querySelector('yt-lockup-metadata-view-model yt-content-metadata-view-model .yt-core-attributed-string__link') as HTMLElement;
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
    var element = ytdVideoRenderer?.querySelector('yt-lockup-metadata-view-model .yt-lockup-metadata-view-model-wiz__title span') as HTMLElement;
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
    var element = ytdVideoRenderer?.querySelector('yt-lockup-metadata-view-model .yt-lockup-metadata-view-model-wiz__title span') as HTMLElement;
    var name = element?.textContent;

    for (let i = 0; i < blackListPhrases.length; i++) {
        var result = name?.includes(blackListPhrases[i])

        if (result) {
            ytdVideoRenderer.remove();
        }
    }
}