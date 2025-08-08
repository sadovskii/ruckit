import { TEMPLATE } from "./black-list-button-templates";

console.log('button: test is loaded @@@@@@@@@@@@@@@@');

window.addEventListener('yt-navigate-finish', q => {
  console.log('button: yt-navigate-finish event fired');

  console.log('button: q = ', q);
  runBlackListScriptsByUrl();
});

document.addEventListener('yt-action', (e) => {
  const action = e?.type;
  if (action === 'yt-append-continuation-items-action' ||
      action === 'yt-update-continuation-items-action') {
    console.log('[YT] New videos are being appended !!!!!!!!!');
    // do your thing here (e.g., re-run injection, analytics, etc.)
  }
});



function runBlackListScriptsByUrl() {
    let timeout = setTimeout(function heartbBeat() {
        document.querySelectorAll('ytd-rich-grid-media ytd-channel-name').forEach(channels => {
            const channelNameElement = channels as HTMLElement;
            if (channelNameElement) {
                channelNameElement.style.backgroundColor = 'red';
            }
        });

        timeout = setTimeout(heartbBeat, 500);
        
    }, 500);
}


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
    // mutation.observe(ytdAppElement, { subtree: true, childList: true })

}
else {
    console.log('button: ytdAppElement is null')
}