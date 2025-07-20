import { TEMPLATE } from "./black-list-button-templates";

export class BlackListChannelRemover {
    static addRemoverOnChannelPage(record: MutationRecord) {
        if (record.target.nodeName === 'YT-PAGE-HEADER-VIEW-MODEL') {

            const htmlelement = record.target as HTMLElement;
            htmlelement.style.backgroundColor = 'yellow';

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
    }

    static addRemoverOnAlmostEverywhere(record: MutationRecord) {
        if (record.target.nodeName === 'YTD-CHANNEL-NAME') {
            const htmlelement = record.target as HTMLElement;
            htmlelement.style.backgroundColor = 'blue';


            const a = htmlelement.closest('td')
        }
    }

    static addRemoverOnVideoPage(record: MutationRecord) {
        if (record.target.nodeName === 'YTD-WATCH-METADATA') {
            const htmlelement = record.target as HTMLElement;
            htmlelement.style.backgroundColor = 'green';

            const owner = htmlelement.querySelector('#owner');

            if (owner) {
                const ownerHtml = owner as HTMLElement;

                let black = owner.querySelector('#black-list-cross');
                if (!black) {

                    const div = document.createElement('div');
                    div.innerHTML = TEMPLATE;

                    black = div.firstElementChild;

                    if (black) {

                        let htmlblack = black as HTMLElement;

                        htmlblack.style.marginLeft = '16px';

                        ownerHtml.appendChild(black);
                    }
                
                    console.log('button: owner is', ownerHtml)
                }
            }
            else {
                console.log('button: owner is not found');
            }
        }
    }
}