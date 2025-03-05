import { getBlackListData } from "../common/common-functionality";

let timeout1 = setTimeout(async function channel() {

	const url = location.href;
	if (!(url.includes('www.youtube.com/watch'))) {
		clearTimeout(timeout1);
		return;
	}

    const watchFlexy = document.querySelector('ytd-page-manager > ytd-watch-flexy');

	// it's recursion that run channel script again till appearance of ytd-watch-flexy and stop previous script
	if (!watchFlexy) {
        timeout1 = setTimeout(channel, 300);
        return;
	}

	const watchFlexyVideoId = watchFlexy.getAttribute('video-id');

	// it's recursion that run channel script again till appearance of video-id and stop previous script
	if (!watchFlexyVideoId || !url.includes(watchFlexyVideoId)) {
		timeout1 = setTimeout(channel, 200);
        return;
	}

	const data = await getBlackListData();

	const title = watchFlexy.querySelector('ytd-watch-metadata #title yt-formatted-string');
    const channelLink = watchFlexy.querySelector('ytd-watch-metadata ytd-video-owner-renderer ytd-channel-name yt-formatted-string a');

	// it's recursion that run channel script again till appearance of 'title' and 'channelLink' and stop previous script
    if (!title || !channelLink) {
        timeout1 = setTimeout(channel, 300);
        return;
    }

	const channelName = title?.textContent;
	var channelNick = channelLink?.getAttribute("href");

	if (channelName && channelNick) {

		if (checkEncodeURI(channelNick)) {
			channelNick = decodeURIComponent(channelNick);
		}

		for (let i = 0; i < data.blackListChannels.length; i++) {
			if (channelNick?.startsWith(data.blackListChannels[i], 1)) {
				replace(watchFlexy);
				return;
			}
		}

		const splited = channelName.toLocaleLowerCase().split(' ');
		for (let i = 0; i < data.blackListWords.length; i++) {
			var result = splited?.some((w) => {
				return w.includes(data.blackListWords[i]?.toLocaleLowerCase())
			})

			if (result) {
				replace(watchFlexy);
				console.log('test: replaced channel with channelName = ', channelName);
				// document.addEventListener('keydown', stopPropagationHandler, true);
				return;
			}
		}

		for (let i = 0; i < data.blackListPhrases.length; i++) {
			var result = channelName?.includes(data.blackListPhrases[i])
	
			if (result) {
				replace(watchFlexy);
				console.log('test: replaced channel with channelName = ', channelName);
				// document.addEventListener('keydown', stopPropagationHandler, true);
				return;
			}
		}
	}


	clearTimeout(timeout1);
});

function replace(watchFlexy: Element) {
	chrome.runtime.sendMessage({restrictedPage: true});
}

function checkEncodeURI(str: string) {
	return /\%/i.test(str)
}
