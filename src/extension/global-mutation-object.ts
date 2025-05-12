export class GlobalMutation {
    private _mutation: MutationObserver;
    private _executions: {( x: MutationRecord ): void }[] = [];

    addExecution(exec: {( x: MutationRecord ): void }) {
        this._executions.push(exec);
    }


    run() {
        if (this._executions.length == 0) {
            console.warn('run was invoked with empty execution');
        }

        this.setMutation();
        this.observe();
    }

    private setMutation() {
        this._mutation = new MutationObserver(async entry => {
            entry.forEach(record => {
                this._executions.forEach(exec => {
                    exec(record);
                })
            })
        });
    }

    private observe() {
        const ytdAppElement = document.querySelector('ytd-app');

        if (ytdAppElement) {
            this._mutation.observe(ytdAppElement, { subtree: true, childList: true, attributes: false })

        }
        else {
            console.log('button: ytdAppElement is null')
        }
    }
}