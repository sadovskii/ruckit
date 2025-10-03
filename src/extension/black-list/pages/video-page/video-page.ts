import { BlackListStorage } from "../../black-list-storage";
import { TEMPLATE } from "../../button/black-list-button-templates";

export class VideoPage {
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
        this._injectBlackListButtonVideoChannel();
        this._injectButtonFeedChannel();
    }

    private _injectBlackListButtonVideoChannel() {
        const ownerPath = '#owner:not(:has(.blb-conainer))';
        const channelNamePath = '#owner ytd-video-owner-renderer #upload-info #channel-name #text-container a';

        var ownerElement = document.querySelector(ownerPath) as HTMLElement;
        var channelNameElement = document.querySelector(channelNamePath) as HTMLElement;

        if (ownerElement && channelNameElement) {
            const newNode = document.createElement('div');
            newNode.innerHTML = TEMPLATE;

            const buttonElement = newNode.firstElementChild as HTMLElement;
            buttonElement.style.marginLeft = '14.5px';

            buttonElement.addEventListener('click', e => this._buttonCrossClickHandler(e, channelNameElement));

            const lastElement = ownerElement.lastElementChild;

            if (lastElement) {
                lastElement.insertAdjacentElement('afterend', buttonElement);
            }
        }
    }

    public blackListInjectAndRemoveElements() {
        const path = 'ytd-item-section-renderer yt-lockup-view-model';

        document.querySelectorAll(path).forEach(contentItem => {
            const contentItemEl = contentItem as HTMLElement;
            if (this.blackListStorage.channelIsTurnedOn) {
                const channelName = contentItem.querySelector('yt-content-metadata-view-model span')?.textContent?.trim();
                
                if (channelName && this.blackListStorage.channelMap.has(channelName)) {
                    contentItem.remove();
                    return;
                }
            }
            
            if (this.blackListStorage.keywordsIsTurnedOn) {
                const videoTitle = contentItem.querySelector('.yt-lockup-metadata-view-model__title')?.textContent?.trim();

                if (!videoTitle) return;

                const splited = videoTitle.toLocaleLowerCase().split(' ');
                for (let i = 0; i < this.blackListStorage.keywords.length; i++) {
                    var result = splited?.some((w) => {
                        return w.includes(this.blackListStorage.keywords[i]?.toLocaleLowerCase())
                    })
        
                    if (result) {
                        contentItem.remove();
                        return;
                    }
                }
            }

            if (this.blackListStorage.phrasesIsTurnedOn) {
                const videoTitle = contentItem.querySelector('.yt-lockup-metadata-view-model__title')?.textContent?.trim();

                if (!videoTitle) return;

                for (let i = 0; i < this.blackListStorage.phrases.length; i++) {
                    var result = videoTitle?.includes(this.blackListStorage.phrases[i])
            
                    if (result) {
                        contentItem.remove();
                        return;
                    }
                }
            }
        });
    }

    private _injectButtonFeedChannel() {
        const path = 'ytd-item-section-renderer yt-content-metadata-view-model:not(:has(.blb-conainer))';

        document.querySelectorAll(path).forEach(contentItem => {
            const channelNameElement = contentItem.querySelector('yt-content-metadata-view-model span') as HTMLElement;

            const newNode = document.createElement('div');
            newNode.innerHTML = TEMPLATE;

            const buttonElement = newNode.firstElementChild as HTMLElement;
            buttonElement.style.marginRight = '3.5px';

            buttonElement.addEventListener('click', e => this._buttonCrossClickHandler(e, channelNameElement));

            channelNameElement.insertAdjacentElement('beforebegin', buttonElement);
        });
    }

    private _removeBlackListButton() {
        const path = '#owner .blb-conainer';

        var button = document.querySelector(path);

        if (button) {
            button.remove();
        }

        const pathVideo = 'ytd-item-section-renderer yt-content-metadata-view-model .blb-conainer';

        document.querySelectorAll(pathVideo).forEach(blackListButton => {
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