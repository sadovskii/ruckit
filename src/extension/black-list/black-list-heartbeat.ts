import { detectYouTubePageType, YouTubePageType } from "../url-detector";
import { BlackListButtonIngestion } from "./button/black-list-button-ingestion";

const ingestion = new BlackListButtonIngestion();

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
            ingestion.injectBlackListButtonOnSearch();
            break;
        default:
            console.log('Unknown or unsupported page type:', pageType);
    }
}