import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";

let timeout1 = setTimeout(async function channel() {

	const url = location.href;
	if (!(url.includes('www.youtube.com/watch'))) {
		console.log('test: not correct url !!!!!!!!!');
		clearTimeout(timeout1);
		return;
	}

    const watchFlexy = document.querySelector('ytd-page-manager > ytd-watch-flexy');

	if (!watchFlexy) {
		console.log('test: some elements are null');

        timeout1 = setTimeout(channel, 300);
        return;
	}

	const watchFlexyVideoId = watchFlexy.getAttribute('video-id');

	if (!watchFlexyVideoId || !url.includes(watchFlexyVideoId)) {
		console.log('test: vidoes id in video and url are not equal');
		timeout1 = setTimeout(channel, 200);
		console.log('test: watchFlexyVideoId = ', watchFlexyVideoId);
        return;
	}

	console.log('test: start getting store');
	const storageBlackLists = await chrome.storage.sync.get([
		STORAGE_BLACKLIST_CHANNELS,
		STORAGE_BLACKLIST_KEYWORDS,
		STORAGE_BLACKLIST_PHRASES
	]);

	console.log('test: storageBlackLists = ', storageBlackLists);

	const blackListChannels: string[] = storageBlackLists[STORAGE_BLACKLIST_CHANNELS] ?? [];
	const blackListWords: string[] = storageBlackLists[STORAGE_BLACKLIST_KEYWORDS] ?? [];
	const blackListPhrases: string[] = storageBlackLists[STORAGE_BLACKLIST_PHRASES] ?? [];

	const title = watchFlexy.querySelector('ytd-watch-metadata #title yt-formatted-string');
    const channelLink = watchFlexy.querySelector('ytd-watch-metadata ytd-video-owner-renderer ytd-channel-name yt-formatted-string a');

    if (!title || !channelLink) {
        console.log('test: some title or channelLink are null');

        timeout1 = setTimeout(channel, 300);
        return;
    }

	const channelName = title?.textContent;
	var channelNick = channelLink?.getAttribute("href");

	console.log('test: channelName = ', channelName);
	console.log('test: channelNick = ', channelNick);

	if (channelName && channelNick) {

		if (checkEncodeURI(channelNick)) {
			channelNick = decodeURIComponent(channelNick);
		}
		
		console.log('test: blackListChannels = ', blackListChannels);
		for (let i = 0; i < blackListChannels.length; i++) {
			if (channelNick?.startsWith(blackListChannels[i], 1)) {
				replace(watchFlexy);
				console.log('test: replaced channel with nick = ', channelNick);
				// document.addEventListener('keydown', stopPropagationHandler, true);
				return;
			}
		}

		const splited = channelName.toLocaleLowerCase().split(' ');
		for (let i = 0; i < blackListWords.length; i++) {
			var result = splited?.some((w) => {
				return w.includes(blackListWords[i]?.toLocaleLowerCase())
			})

			if (result) {
				replace(watchFlexy);
				console.log('test: replaced channel with channelName = ', channelName);
				// document.addEventListener('keydown', stopPropagationHandler, true);
				return;
			}
		}

		for (let i = 0; i < blackListPhrases.length; i++) {
			var result = channelName?.includes(blackListPhrases[i])
	
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
