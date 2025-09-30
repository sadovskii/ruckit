import { BlackListStorage } from "../../black-list-storage";
import { TEMPLATE } from "../../button/black-list-button-templates";

export class FeedPage {
    constructor(public blackListStorage: BlackListStorage) {
        
    }

    public blackListButton() {
        if (this.blackListStorage.channelIsTurnedOn) {
            this._injectBlackListButton()
        }
        else {
            this._removeBlackListButton();
        }
    }

    private _injectBlackListButton() {
        const path = 'ytd-rich-item-renderer yt-content-metadata-view-model:not(:has(.blb-conainer))';

        document.querySelectorAll(path).forEach(channelInfo => {
            const channelInfoElement = channelInfo as HTMLElement;
            if (channelInfoElement) {
                const metadataText = channelInfoElement.firstElementChild?.querySelector(".yt-core-attributed-string");

                if (metadataText) {
                    const metadataTextElement = metadataText as HTMLElement;
                    const metadataTextLinkElement = metadataTextElement.querySelector("a");

                    if (!metadataTextLinkElement) return;

                    const newNode = document.createElement('div');
                    newNode.innerHTML = TEMPLATE;

                    const buttonElement = newNode.firstElementChild as HTMLElement;
                    buttonElement.style.marginRight = '3.5px';

                    buttonElement.addEventListener('click', e => this._buttonCrossClickHandler(e, metadataTextLinkElement));

                    metadataTextElement.insertAdjacentElement('beforebegin', buttonElement);
                }
            }
        });
    }

    private _removeBlackListButton() {
        const path = 'ytd-rich-item-renderer yt-content-metadata-view-model .blb-conainer';

        document.querySelectorAll(path).forEach(blackListButton => {
            blackListButton.remove();
        });
    }

    private _buttonCrossClickHandler(e: Event, linkToChannel: HTMLElement) {
        e.stopPropagation();
        e.preventDefault();

        if (linkToChannel) {
            let channelName = linkToChannel.textContent?.trim();

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

    public blackListRemoveElements() {
        if (!this.blackListStorage.channelIsTurnedOn) {
            return;
        }

        document.querySelectorAll('ytd-rich-item-renderer').forEach(itemElement => {
            const htmlItemElement = itemElement as HTMLElement;

            const path = '#content yt-content-metadata-view-model .yt-core-attributed-string a';
            let channelName = htmlItemElement?.querySelector(path)?.textContent?.trim();

            if (channelName) {
                if (channelName.length > 60) {
                    channelName = channelName.substring(0, 60);
                }

                if (this.blackListStorage.channelMap.has(channelName)) {
                    htmlItemElement.remove();
                }
            }
        });
    }
}