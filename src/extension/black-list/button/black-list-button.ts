import { TEMPLATE } from "./black-list-button-templates";

const mutation = new MutationObserver(async entry => {

    entry.forEach(record => {
        if (record.type == 'childList') {
            if (record) {

                if (record.target.nodeType === Node.ELEMENT_NODE) {

                    if (record.target.nodeName.localeCompare('ytd-channel-name', ['en'], {sensitivity: 'base'}) === 0) {
                        const htmlelement = record.target as HTMLElement;
                        htmlelement.style.backgroundColor = 'blue';
                    }

                    if (record.target.nodeName.localeCompare('yt-flexible-actions-view-model', ['en'], {sensitivity: 'base'}) === 0) {
                        const htmlelement = record.target as HTMLElement;

                        if (htmlelement) {
                            // const action = htmlelement.querySelector('yt-flexible-actions-view-model');

                            if (htmlelement) {
                                console.log('button: htmlElement = ', htmlelement);
                                // htmlelement.innerHTML += TEMPLATE;
                            }
                        }

                        htmlelement.style.backgroundColor = 'yellow';
                    }

                    if (record.target.nodeName.localeCompare('ytd-watch-metadata', ['en'], {sensitivity: 'base'}) === 0) {
                        const htmlelement = record.target as HTMLElement;
                        htmlelement.style.backgroundColor = 'green';
                    }

                }
            }
        }
    })
})

const ytdAppElement = document.querySelector('ytd-app');

if (ytdAppElement) {
    mutation.observe(ytdAppElement, { subtree: true, childList: true })

}
else {
    console.log('button: ytdAppElement is null')
}