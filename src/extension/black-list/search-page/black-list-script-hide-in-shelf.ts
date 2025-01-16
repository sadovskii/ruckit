import { BlackListData } from "../black-list-models";
import { hideVideos } from "./black-list-script-hide-video";

const SHELF_RENDER_LOCAL_NAME = 'ytd-shelf-renderer';

export function hideElementsInShelf(htmlElement: HTMLElement, data: BlackListData) {
    if (htmlElement.localName === SHELF_RENDER_LOCAL_NAME) {

        // checking ytd-vertical-list-renderer is very important, because there are difference ytd-shelf-renderer
        // latest posts where there is yt-horizontal-list-renderer instead ytd-vertical-list-renderer
        // having ytd-vertical-list-renderer is like confidence that I work with needed for me ytd-shelf-renderer
        var verticalElement = htmlElement.querySelector('ytd-vertical-list-renderer');

        if (verticalElement) {
            const itemsElement = verticalElement.querySelector('#items');

            if (itemsElement) {
                // getting video is enough becouse only video can be in shelf
                const videoElements = Array.from(itemsElement?.getElementsByTagName("ytd-video-renderer")  as HTMLCollectionOf<HTMLElement>);
                videoElements.forEach(video => {
                    hideVideos(video, data);
                })
            }

            
            // this element is important because there are shelfs with more button and without it
            // when there is it's important to subscribe on click event because then there coulde be black list content
            const moreDiv = verticalElement.querySelector('#more yt-formatted-string');
            
            if (moreDiv) {
                moreDiv?.addEventListener('click', () => {
                    if (itemsElement) {
                        // getting video is enough becouse only video can be in shelf
                        const videoElements = Array.from(itemsElement?.getElementsByTagName("ytd-video-renderer")  as HTMLCollectionOf<HTMLElement>);
                        videoElements.forEach(video => {
                            hideVideos(video, data);
                        })
                    }
                })
            }
        }
    }
}