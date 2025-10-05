import { HideListItemType } from "src/app/settings/layout-content/hide-list/hide-list.models";
import { HideListStorage } from "../hide-list/hide-list-storage";
import { detectYouTubePageType, YouTubePageType } from "../url-detector";
import { BlackListStorage } from "./black-list-storage";
import { ChannelPage } from "./pages/channel-page/channel-page";
import { ChannelPageRedirect } from "./pages/channel-page/channel-page-redirect";
import { FeedPage } from "./pages/feed-page/feed-page";
import { SearchPage } from "./pages/search-page/search-page";
import { ShortPageRedirect } from "./pages/short-page/short-page-redirect";
import { VideoPage } from "./pages/video-page/video-page";
import { VideoPageRedirect } from "./pages/video-page/video-page-redirect";

const blacklistStorage = new BlackListStorage();
const hidelistStorage = new HideListStorage();
await blacklistStorage.init();
await blacklistStorage.initHandler();
await hidelistStorage.init();
await hidelistStorage.initUpdateHandler();

runHeartbeat();

console.log('black-list-heartbeat: heartbeat script is loaded');

function runHeartbeat() {
    let timeout = setTimeout(function heartbBeat() {
        const type = detectYouTubePageType(window.location.href);
        runFunctionOnPageType(type);
        timeout = setTimeout(heartbBeat, 1000);
        
    }, 1000);
}


function runFunctionOnPageType(pageType: YouTubePageType) {
    switch (pageType) {
        case YouTubePageType.Search:
            const searchPage = new SearchPage(blacklistStorage);
            searchPage.blackListButtonOnSearch();
            searchPage.blackListRemoveElements();
            break;
        case YouTubePageType.HomeOrExplore:
            const feedPage = new FeedPage(blacklistStorage);
            feedPage.blackListButton();
            feedPage.blackListRemoveElements();
            break;
        case YouTubePageType.ChannelHome:
        case YouTubePageType.ChannelTab:
            const channelPage = new ChannelPage(blacklistStorage);
            const channelPageRedirect = new ChannelPageRedirect(blacklistStorage);
            channelPage.blackListButton();
            channelPageRedirect.channelPageRedirect();
            break;
        case YouTubePageType.EmbedVideo:
        case YouTubePageType.Watch:
        case YouTubePageType.WatchLive:
            const videoPage = new VideoPage(blacklistStorage);
            const videoPageRedirect = new VideoPageRedirect(blacklistStorage);
            videoPage.blackListButton();
            videoPage.blackListInjectAndRemoveElements();
            videoPageRedirect.videoPageRedirect();
            break;
        case YouTubePageType.Shorts:
            const shortPage = new ShortPageRedirect(hidelistStorage);
            shortPage.channelPageRedirect();
            break;
        default:
    }
}