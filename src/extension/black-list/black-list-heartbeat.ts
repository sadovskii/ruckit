import { detectYouTubePageType, YouTubePageType } from "../url-detector";
import { BlackListStorage } from "./black-list-storage";
import { BlackListButtonIngestion } from "./button/black-list-button-ingestion";
import { ChannelPage } from "./pages/channel-page/channel-page";
import { ChannelPageRedirect } from "./pages/channel-page/channel-page-redirect";
import { FeedPage } from "./pages/feed-page/feed-page";
import { SearchPage } from "./pages/search-page/search-page";
import { VideoPage } from "./pages/video-page/video-page";

const ingestion = new BlackListButtonIngestion();
const storage = new BlackListStorage();
await storage.init();
await storage.initHandler();

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
            const searchPage = new SearchPage(storage);
            searchPage.blackListButtonOnSearch();
            searchPage.blackListRemoveElements();
            break;
        case YouTubePageType.HomeOrExplore:
            const feedPage = new FeedPage(storage);
            feedPage.blackListButton();
            feedPage.blackListRemoveElements();
            break;
        case YouTubePageType.ChannelHome:
        case YouTubePageType.ChannelTab:
            const channelPageRedirect = new ChannelPageRedirect(storage);
            const channelPage = new ChannelPage(storage);
            channelPage.blackListButton();
            channelPageRedirect.videoPageRedirect();
            break;
        case YouTubePageType.EmbedVideo:
        case YouTubePageType.Watch:
        case YouTubePageType.WatchLive:
            const videoPage = new VideoPage(storage);
            videoPage.blackListButton();
            break;
        default:
    }
}