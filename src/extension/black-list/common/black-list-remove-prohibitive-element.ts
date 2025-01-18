import { stopPropagationHandler } from "../video/black-list-video";

const prohibitiveElement = document.getElementById("ruckit-constraint-main");

if (prohibitiveElement) {
    prohibitiveElement.remove();
    document.removeEventListener('keydown', stopPropagationHandler, true);
    console.log('test: -=-=-=- removed pE');
}

