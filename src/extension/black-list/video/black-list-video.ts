import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";
import { blackListProhibitiveElement } from "../common/black-list-prohibitive-element";

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

// const mo = new MutationObserver(records => {
// 	records.forEach(r => {
// 		const video = r.target as HTMLVideoElement;
// 		const attrValue = video.getAttribute('src');

// 		console.log("test: attr value = ", attrValue);
// 		console.log("test: video in m = ", video);
// 		if (attrValue && attrValue.length > 1) {
// 			console.log("test: mutation = ", r);
// 			video.src = '';
// 		}
// 	})
// })

function replace(watchFlexy: Element) {
	// var template = document.createElement('template');
	// template.innerHTML = blackListProhibitiveElement;

	// watchFlexy.replaceWith(template.content);

	chrome.runtime.sendMessage({restrictedPage: true});
}


	// // Adding a global event listener for keydown events
	// document.addEventListener('keydown', function(event) {
	// 	event.stopPropagation();
	// 	event.preventDefault();
	// }, true); // Use capture mode to prioritize this listener

	// // Adding a global event listener for keydown events
	// document.addEventListener('keyup', function(event) {
	// 	event.stopPropagation();
	// 	event.preventDefault();
	// }, true); // Use capture mode to prioritize this listener

	function sleep(milliseconds: number) {
		const date = Date.now();
		let currentDate = null;
		do {
		  currentDate = Date.now();
		} while (currentDate - date < milliseconds);
	  }

// Define the event handler
export function stopPropagationHandler(e: any) {
    if ([' ', 'k', 'f', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
        e.stopPropagation();
    }
}
