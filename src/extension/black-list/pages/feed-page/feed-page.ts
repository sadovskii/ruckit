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
        const path = 'ytd-rich-item-renderer yt-content-metadata-view-model';
        const maxInsertionsPerRun = 16;
        let insertions = 0;
        const channelInfos = Array.from(document.querySelectorAll(path)).reverse();

        channelInfos.forEach(channelInfo => {
            if (insertions >= maxInsertionsPerRun) return;

            const channelInfoElement = channelInfo as HTMLElement;
            if (channelInfoElement.querySelector('.blb-conainer')) return;

            const metadataRow = channelInfoElement.querySelector('.ytContentMetadataViewModelMetadataRow') as HTMLElement | null;
            const metadataTextLinkElement = metadataRow?.querySelector('a.ytAttributedStringLink') as HTMLElement | null;

            if (!metadataRow || !metadataTextLinkElement) return;

            const newNode = document.createElement('div');
            newNode.innerHTML = TEMPLATE;

            const buttonElement = newNode.firstElementChild as HTMLElement | null;
            if (!buttonElement) return;

            const metadataWrapper = metadataRow.parentElement as HTMLElement | null;
            const richItemElement = channelInfoElement.closest('ytd-rich-item-renderer') as HTMLElement | null;
            const richItemContentElement = richItemElement?.querySelector('#content') as HTMLElement | null;

            channelInfoElement.style.overflow = 'visible';
            metadataRow.style.overflow = 'visible';
            metadataWrapper?.style.setProperty('overflow', 'visible');
            richItemElement?.style.setProperty('overflow', 'visible');
            richItemContentElement?.style.setProperty('overflow', 'visible');

            metadataRow.style.display = 'flex';
            metadataRow.style.alignItems = 'center';

            buttonElement.style.marginRight = '6px';
            buttonElement.style.marginBottom = '0';
            buttonElement.style.display = 'inline-flex';
            buttonElement.style.alignItems = 'center';
            buttonElement.style.alignSelf = 'center';
            buttonElement.style.position = 'relative';
            buttonElement.style.zIndex = '501';
            buttonElement.addEventListener('click', e => this._buttonCrossClickHandler(e, metadataTextLinkElement));

            metadataRow.insertBefore(buttonElement, metadataRow.firstChild);
            insertions++;
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

            if (this.blackListStorage.channelIsTurnedOn) {
                const path = '#content yt-content-metadata-view-model .ytContentMetadataViewModelMetadataRow a.ytAttributedStringLink, #content yt-content-metadata-view-model .yt-core-attributed-string a';
                let channelName = htmlItemElement?.querySelector(path)?.textContent?.trim();

                if (channelName) {
                    if (channelName.length > 60) {
                        channelName = channelName.substring(0, 60);
                    }

                    if (this.blackListStorage.channelMap.has(channelName)) {
                        htmlItemElement.remove();
                        return;
                    }
                }
            }

            if (this.blackListStorage.keywordsIsTurnedOn) {
                var videoName = htmlItemElement?.querySelector('.ytLockupMetadataViewModelHeadingReset, .yt-lockup-metadata-view-model__heading-reset')?.textContent?.trim();
                if (!videoName) return;

                const splited = videoName.toLocaleLowerCase().split(' ');
                for (let i = 0; i < this.blackListStorage.keywords.length; i++) {
                    var result = splited?.some((w) => {
                        return w.includes(this.blackListStorage.keywords[i]?.toLocaleLowerCase())
                    })
        
                    if (result) {
                        htmlItemElement.remove();
                        return;
                    }
                }
            }
            if (this.blackListStorage.phrasesIsTurnedOn) {
                var videoName = htmlItemElement?.querySelector('.ytLockupMetadataViewModelHeadingReset, .yt-lockup-metadata-view-model__heading-reset')?.textContent?.trim();
                if (!videoName) return;

                for (let i = 0; i < this.blackListStorage.phrases.length; i++) {
                    var result = videoName?.includes(this.blackListStorage.phrases[i])
            
                    if (result) {
                        htmlItemElement.remove();
                        return;
                    }
                }
            }
        });
    }
}