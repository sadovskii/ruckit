runHeartbeat();

console.log('black-list-heartbeat: heartbeat script is loaded');

function runHeartbeat() {
    let timeout = setTimeout(function heartbBeat() {
        document.querySelectorAll('ytd-channel-name').forEach(channels => {
            const channelNameElement = channels as HTMLElement;
            if (channelNameElement) {
                channelNameElement.style.backgroundColor = 'red';
            }
        });

        document.querySelectorAll('yt-content-metadata-view-model .yt-content-metadata-view-model-wiz__metadata-row').forEach(channels => {
            const channelNameElement = channels as HTMLElement;
            if (channelNameElement) {
                channelNameElement.style.backgroundColor = 'blue';
            }
        });

        timeout = setTimeout(heartbBeat, 1000);
        
    }, 1000);
}