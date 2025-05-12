import { TEMPLATE } from "./black-list-button-templates";

export class BlackListChannelRemover {
    static addRemoverToVideoPage(record: MutationRecord) {
        if (record.target.nodeName.localeCompare('yt-page-header-view-model', ['en'], {sensitivity: 'base'}) === 0) {

            console.log('button: ', record);
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
    }
}