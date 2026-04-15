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
        const actionsPath = 'yt-page-header-renderer yt-flexible-actions-view-model';
        const channelNamePath = 'yt-page-header-renderer yt-dynamic-text-view-model h1 span.ytAttributedStringHost, yt-page-header-renderer yt-dynamic-text-view-model h1 span';

        const actionsElement = document.querySelector(actionsPath) as HTMLElement | null;
        const channelNameElement = document.querySelector(channelNamePath) as HTMLElement | null;

        if (actionsElement && channelNameElement && !actionsElement.querySelector('.blb-conainer')) {
            const newNode = document.createElement('div');
            newNode.innerHTML = TEMPLATE;

            const buttonElement = newNode.firstElementChild as HTMLElement | null;
            if (!buttonElement) return;
            buttonElement.style.marginLeft = '11px';

            buttonElement.addEventListener('click', e => this._buttonCrossClickHandler(e, channelNameElement));

            const lastElement = actionsElement.lastElementChild;

            if (lastElement) {
                lastElement.insertAdjacentElement('afterend', buttonElement);
            }
        }
    }


    private _removeBlackListButton() {
        const path = 'yt-page-header-renderer yt-flexible-actions-view-model .blb-conainer';

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