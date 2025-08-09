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

        timeout = setTimeout(heartbBeat, 1000);
        
    }, 1000);
}