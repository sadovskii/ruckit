export class BlackListButtonIngestion {
    injectBlackListButtonOnSearch() {
        document.querySelectorAll('ytd-video-renderer ytd-channel-name').forEach(channels => {
            const channelNameElement = channels as HTMLElement;
            if (channelNameElement) {
                channelNameElement.style.backgroundColor = 'red';
            }
        });
    }
}