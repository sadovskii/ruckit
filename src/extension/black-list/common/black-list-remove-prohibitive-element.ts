import { blackListProhibitiveElement } from "./black-list-prohibitive-element";
import { t } from "src/app/shared/i18n/i18n";

document.title = t('restricted_page_title');

let timeout = setTimeout(function prohibitedContent() {
    const iframe = document.querySelector("iframe");
    
    if (!iframe) {
        timeout = setTimeout(prohibitedContent, 300);
        return;
    }

    const prohibitedBlock = iframe.contentWindow?.document.getElementById('error-page-content');

    if (!prohibitedBlock) {
        timeout = setTimeout(prohibitedContent, 300);
        return;
    }

    const elementsForRemove = prohibitedBlock.querySelectorAll(':scope > p, :scope > #yt-masthead');
    
    if (elementsForRemove) {
        elementsForRemove.forEach(e => {
            e.remove();
        })
    }

    const picture = prohibitedBlock.querySelector(':scope > img');

    if (picture) {
        var template = document.createElement('template');
        template.innerHTML = blackListProhibitiveElement;
    
        picture.replaceWith(template.content);
    }
});

