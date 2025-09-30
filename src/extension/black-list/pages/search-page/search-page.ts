import { BlackListStorage } from "../../black-list-storage";
import { TEMPLATE } from "../../button/black-list-button-templates";
import { PercentEncoding } from "../../common/percent-encoding";

export class SearchPage {
    constructor(public blackListStorage: BlackListStorage) {
    }

    public blackListButtonOnSearch() {
        if (this.blackListStorage.channelIsTurnedOn) {
            this._injectBlackListButtonOnSearch()
        }
        else {
            this._removeBlackListButtonOnSearch();
        }
    }

    private _injectBlackListButtonOnSearch() {
        const path = 'ytd-video-renderer #channel-info:not(:has(.blb-conainer))';

        document.querySelectorAll(path).forEach(channelInfo => {
            const channelInfoElement = channelInfo as HTMLElement;
            if (channelInfoElement) {
                const thumbnail = channelInfoElement.querySelector('#channel-thumbnail');

                if (thumbnail) {
                    const thumbnailElement = thumbnail as HTMLElement;
                    thumbnailElement.style.paddingRight = '6px';

                    const newNode = document.createElement('div');
                    newNode.innerHTML = TEMPLATE;

                    const buttonElement = newNode.firstElementChild as HTMLElement;
                    buttonElement.style.marginRight = '3.5px';

                    buttonElement.addEventListener('click', e => this._buttonCrossClickHandler(e, channelInfoElement));

                    thumbnailElement.insertAdjacentElement('afterend', buttonElement);
                }
            }
        });
    }

    private _removeBlackListButtonOnSearch() {
        const path = 'ytd-video-renderer #channel-info .blb-conainer';

        document.querySelectorAll(path).forEach(blackListButton => {
            blackListButton.remove();
        });
    }

    public blackListRemoveElements() {
        if (!this.blackListStorage.channelIsTurnedOn) {
            return;
        }

        const path = 'ytd-video-renderer';

        document.querySelectorAll(path).forEach(videoElement => {
            const htmlElement = videoElement as HTMLElement;

            let channelName = htmlElement?.querySelector('#channel-info ytd-channel-name .yt-simple-endpoint')?.textContent?.trim();

            if (channelName) {
                if (channelName.length > 60) {
                    channelName = channelName.substring(0, 60);
                }

                if (this.blackListStorage.channelMap.has(channelName)) {
                    htmlElement.remove();
                }
            }
        });

        document.querySelectorAll("ytd-channel-renderer").forEach(channelElement => {
            const htmlElement = channelElement as HTMLElement;
            let channelName = htmlElement?.querySelector('ytd-channel-name #text')?.textContent?.trim();

            if (channelName) {
                if (channelName.length > 60) {
                    channelName = channelName.substring(0, 60);
                }

                if (this.blackListStorage.channelMap.has(channelName)) {
                    htmlElement.remove();
                }
            }
        });
    }

    private _buttonCrossClickHandler(e: Event, channelInfoElement: HTMLElement) {
        const linkToChannel = channelInfoElement.querySelector("ytd-channel-name .yt-simple-endpoint");
        e.stopPropagation();
        e.preventDefault();

        if (linkToChannel) {
            let channelName = linkToChannel.textContent?.trim();

            if (!channelName) return;

            if (channelName.length > 60) {
                channelName = channelName.substring(0, 60);
            }
            
            this._channelTackle(channelName);

            console.log("black list channel = ", this.blackListStorage.channels);
            console.log("black list channel map = ", this.blackListStorage.channelMap);
        }
    }

    private _channelTackle(channelName?: string) {
        this.blackListStorage.setBlackListChannel(channelName);
    }
}