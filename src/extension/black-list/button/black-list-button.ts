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

                    if (record.target.nodeName.localeCompare('yt-page-header-view-model', ['en'], {sensitivity: 'base'}) === 0) {
                        const htmlelement = record.target as HTMLElement;
                        htmlelement.style.backgroundColor = 'yellow';
                        console.log("button: t-page-header-view-modelß");

                        if (htmlelement) {

                            let counter = 0;
                            const wait = 500;

                            let timeout = setTimeout(function findActions() {
                                const action = htmlelement.querySelector('yt-flexible-actions-view-model');
                                console.log('button: action = ', action);

                                if (action) {
                                    const actionHtml = action as HTMLElement;
                                    actionHtml.innerHTML += TEMPLATE;
                                    clearTimeout(timeout);
                                }
                                else if (counter > 5) {
                                    clearTimeout(timeout);
                                }
                                else {
                                    counter++;
                                    timeout = setTimeout(findActions, wait);
                                    console.log("button: haven't found. count = ", counter);
                                }

                            });
                        }
                    }

                    if (record.target.nodeName.localeCompare('ytd-watch-metadata', ['en'], {sensitivity: 'base'}) === 0) {
                        const htmlelement = record.target as HTMLElement;
                        htmlelement.style.backgroundColor = 'green';

                        const owner = htmlelement.querySelector('#owner');

                        if (owner) {
                            const ownerHtml = owner as HTMLElement;
                            ownerHtml.innerHTML += TEMPLATE;
                            console.log('button: owner is', ownerHtml)
                        }
                        else {
                            console.log('button: owner is not found');
                        }
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