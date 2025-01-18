import { BlackListData } from "../black-list-models";
import { hideChannel } from "./black-list-script-hide-channel";
import { hideElementsInShelf } from "./black-list-script-hide-in-shelf";
import { hideLocupView } from "./black-list-script-hide-lockup-view";
import { hideVideos } from "./black-list-script-hide-video";

// hide element. methods inside to check htmlElement type and it is method makes manipulations with this one
export function hideElement(htmlElement: HTMLElement, data: BlackListData) {
    hideVideos(htmlElement, data);
    hideChannel(htmlElement, data);
    hideElementsInShelf(htmlElement, data);
    hideLocupView(htmlElement, data);
}