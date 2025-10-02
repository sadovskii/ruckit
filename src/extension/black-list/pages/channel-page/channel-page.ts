import { BlackListStorage } from "../../black-list-storage";
import { TEMPLATE } from "../../button/black-list-button-templates";
import { ChannelPageRedirect } from "./channel-page-redirect";

export class ChannelPage {
    constructor(public blackListStorage: BlackListStorage) {}

    public blackListButton() {
        if (this.blackListStorage.channelIsTurnedOn) {
            this._injectBlackListButton()
        }
        else {
            this._removeBlackListButton();
        }
    }

    private _injectBlackListButton() {
        const actionsPath = 'yt-page-header-renderer yt-flexible-actions-view-model:not(:has(.blb-conainer))';
        const channelNamePath = 'yt-page-header-renderer .yt-page-header-view-model__page-header-title span';

        var actionsElement = document.querySelector(actionsPath) as HTMLElement;
        var channelNameElement = document.querySelector(channelNamePath) as HTMLElement;

        if (actionsElement && channelNameElement) {
            const newNode = document.createElement('div');
            newNode.innerHTML = TEMPLATE;

            const buttonElement = newNode.firstElementChild as HTMLElement;
            buttonElement.style.marginLeft = '11px';

            buttonElement.addEventListener('click', e => this._buttonCrossClickHandler(e, channelNameElement));

            const lastElement = actionsElement.lastElementChild;

            if (lastElement) {
                lastElement.insertAdjacentElement('afterend', buttonElement);
            }
        }
    }


    private _removeBlackListButton() {
        const path = 'ytd-rich-item-renderer yt-content-metadata-view-model .blb-conainer';

        document.querySelectorAll(path).forEach(blackListButton => {
            blackListButton.remove();
        });
    }

    private _buttonCrossClickHandler(e: Event, channelInfoElement: HTMLElement) {
        e.stopPropagation();
        e.preventDefault();

        if (channelInfoElement) {
            let channelName = channelInfoElement.textContent?.trim();

            if (!channelName) return;

            if (channelName.length > 60) {
                channelName = channelName.substring(0, 60);
            }
            
            this._channelTackle(channelName);
        }
    }

    private _channelTackle(channelName?: string) {
        this.blackListStorage.setBlackListChannel(channelName);
    }
}