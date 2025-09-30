import { BlackListStorage } from "../black-list-storage";
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
		console.log('test: watchFlexy is null');
        timeout1 = setTimeout(channel, 300);
        return;
	}

	const watchFlexyVideoId = watchFlexy.getAttribute('video-id');

	// it's recursion that run channel script again till appearance of video-id and stop previous script
	if (!watchFlexyVideoId || !url.includes(watchFlexyVideoId)) {
		console.log('test: watchFlexyVideoId is null');
		timeout1 = setTimeout(channel, 200);
        return;
	}

	const data = new BlackListStorage();
	await data.init();

	const title = watchFlexy.querySelector('ytd-watch-metadata #title yt-formatted-string');
    const channelLink = watchFlexy.querySelector('ytd-watch-metadata ytd-video-owner-renderer ytd-channel-name yt-formatted-string a');

	// it's recursion that run channel script again till appearance of 'title' and 'channelLink' and stop previous script
    if (!title || !channelLink) {
		console.log('test: channelLink is null');
        timeout1 = setTimeout(channel, 300);
        return;
    }

	const videoName = title?.textContent?.trim();
	let channelName = channelLink?.textContent?.trim();

	if (videoName && channelName) {
		if (channelName.length > 60) {
			channelName = channelName.substring(0, 60);
		}

		console.log("data map = ", data.channelMap);
		if (data.channelIsTurnedOn) {
			if (data.channelMap.has(channelName)) {
				replace(watchFlexy);
				return;
			}
		}

		const splited = videoName.toLocaleLowerCase().split(' ');
		for (let i = 0; i < data.keywords.length; i++) {
			var result = splited?.some((w) => {
				return w.includes(data.keywords[i]?.toLocaleLowerCase())
			})

			if (result) {
				replace(watchFlexy);
				console.log('test: replaced channel with channelName = ', videoName);
				// document.addEventListener('keydown', stopPropagationHandler, true);
				return;
			}
		}

		for (let i = 0; i < data.phrases.length; i++) {
			var result = videoName?.includes(data.phrases[i])
	
			if (result) {
				replace(watchFlexy);
				console.log('test: replaced channel with channelName = ', videoName);
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
