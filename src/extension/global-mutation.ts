export class GlobalMutation {
    private _mutation: MutationObserver;

    constructor() {
        this.setMutation();
        this.observe();
    }

    private setMutation() {
        this._mutation = new MutationObserver(async entry => {
            entry.forEach(record => {

            })
        });
    }

    private observe() {
        const ytdAppElement = document.querySelector('ytd-app');

        if (ytdAppElement) {
            this._mutation.observe(ytdAppElement, { subtree: true, childList: true })

        }
        else {
            console.log('button: ytdAppElement is null')
        }
    }
}