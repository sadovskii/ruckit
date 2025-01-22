import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";
import { getBlackListData } from "../common/common-functionality";

let counter = 0;
let timeout = setTimeout(async function channel() {
    const browse = document.querySelector('ytd-page-manager ytd-browse[page-subtype="channels"][role="main"]');

    if (!browse) {
        console.log('test: brows is null')
        timeout = setTimeout(channel, 100);
		counter++
        return;
    }
	else if (counter > 10) {
		clearTimeout(timeout);
		return;
	}

    clearTimeout(timeout);

	const data = await getBlackListData();


	// console.log("test: storageBlackLists = ", storageBlackLists);


	const channelName = browse.querySelector('yt-page-header-renderer yt-dynamic-text-view-model h1 span')?.textContent;
	const channelNick = browse.querySelector('yt-page-header-renderer yt-content-metadata-view-model .yt-core-attributed-string span')?.textContent;

	// console.log('test: channelName = ', channelName);
	// console.log('test: channelNick = ', channelNick);

	if (channelName && channelNick) {
		data.blackListChannels.forEach(blackChannel => {
            // start with from 1 because always in href value is /@something
            if (channelNick?.startsWith(blackChannel)) {
				replace(browse);
				console.log('test: replaced channel with nick = ', channelNick);
				return;
            }
        })

		if (channelName) {
			const splited = channelName?.toLocaleLowerCase().split(' ');
			for (let i = 0; i < data.blackListWords.length; i++) {
				var result = splited?.some((w) => {
					return w.includes(data.blackListWords[i]?.toLocaleLowerCase())
				})
	
				if (result) {
					replace(browse);
					console.log('test: replaced channel with channelName = ', channelName);
					return;
				}
			}

			for (let i = 0; i < data.blackListPhrases.length; i++) {
				var result = channelName?.includes(data.blackListPhrases[i])
		
				if (result) {
					replace(browse);
					console.log('test: replaced channel with channelName = ', channelName);
					return;
				}
			}
		}
	}
})




function replace(browse: Element) {
	chrome.runtime.sendMessage({restrictedPage: true});
}