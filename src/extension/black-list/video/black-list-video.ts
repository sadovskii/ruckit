import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";
import { blackListProhibitiveElement } from "../common/black-list-prohibitive-element";

let timeout1 = setTimeout(async function channel() {

	const url = location.href;
	if (!url.includes('www.youtube.com/watch')) {
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
		timeout1 = setTimeout(channel, 300);
		console.log('test: watchFlexyVideoId = ', watchFlexyVideoId);
        return;
	}

	const storageBlackLists = await chrome.storage.sync.get([
		STORAGE_BLACKLIST_CHANNELS,
		STORAGE_BLACKLIST_KEYWORDS,
		STORAGE_BLACKLIST_PHRASES
	]);

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
				document.addEventListener('keydown', stopPropagationHandler, true);
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
				document.addEventListener('keydown', stopPropagationHandler, true);
				return;
			}
		}

		for (let i = 0; i < blackListPhrases.length; i++) {
			var result = channelName?.includes(blackListPhrases[i])
	
			if (result) {
				replace(watchFlexy);
				console.log('test: replaced channel with channelName = ', channelName);
				document.addEventListener('keydown', stopPropagationHandler, true);
				return;
			}
		}
	}


	clearTimeout(timeout1);
});

function replace(element: Element) {
	var t = document.createElement('template');
	t.innerHTML = blackListProhibitiveElement;

	element.replaceWith(t.content);
	// const items = element?.querySelectorAll(':scope > *');
    
    // console.log("test: items = ", items);
    // items?.forEach(item => {
    //     item.remove();
    // })
    
    // if (element) {
    //     element.innerHTML = test1;
    // }
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