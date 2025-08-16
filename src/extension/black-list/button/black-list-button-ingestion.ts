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

                    const buttonElement = newNode.firstElementChild as HTMLElement;
                    buttonElement.style.marginRight = '3.5px';

                    buttonElement.addEventListener('click', e => this._buttonCrossClickHandler(e, channelInfoElement));

                    thumbnailElement.insertAdjacentElement('afterend', buttonElement);
                }
            }
        });
    }

    private _buttonCrossClickHandler(e: Event, channelInfoElement: HTMLElement) {
        console.log(`Blacklisting clicked!`);


        const linkToChannel = channelInfoElement.querySelector("ytd-channel-name .yt-simple-endpoint");
        e.stopPropagation();
        e.preventDefault();


        if (linkToChannel) {
            const channelUrl = linkToChannel.getAttribute('href');
            if (channelUrl) {

                const index = channelUrl.indexOf('@'); // find position of '@'

                if (index !== -1) {
                    const result = channelUrl.substring(index); // from '@' to end
                    console.log(`Blacklisting channel: ${result}`);
                }
                else {
                    
                }
                // Here you can handle the blacklisting logic, e.g., send the URL to a server or store it locally
                
            }
        }
    }
}