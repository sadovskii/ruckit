import { TEMPLATE } from "./black-list-button-templates";

export class BlackListButtonIngestion {
    injectBlackListButtonOnSearch() {
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

                    const mainElement = newNode.firstElementChild as HTMLElement;
                    mainElement.style.marginRight = '3.5px';

                    thumbnailElement.insertAdjacentElement('afterend', mainElement);
                }
            }
        });
    }
}