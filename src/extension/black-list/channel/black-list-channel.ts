import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";
import { blackListProhibitiveElement } from "../common/black-list-prohibitive-element";

let timeout = setTimeout(async function channel() {
	// const browses = document.querySelectorAll('ytd-page-manager ytd-browse');

    const browse = document.querySelector('ytd-page-manager ytd-browse[page-subtype="channels"][role="main"]');

    if (!browse) {
        console.log('test: brows is null')
        timeout = setTimeout(channel, 100);
        return;
    }

    clearTimeout(timeout);

	const storageBlackLists = await chrome.storage.sync.get([
		STORAGE_BLACKLIST_CHANNELS,
		STORAGE_BLACKLIST_KEYWORDS,
		STORAGE_BLACKLIST_PHRASES
	]);

	const blackListChannels: string[] = storageBlackLists[STORAGE_BLACKLIST_CHANNELS] ?? [];
    const blackListWords: string[] = storageBlackLists[STORAGE_BLACKLIST_KEYWORDS] ?? [];
    const blackListPhrases: string[] = storageBlackLists[STORAGE_BLACKLIST_PHRASES] ?? [];


	// console.log("test: storageBlackLists = ", storageBlackLists);


	const channelName = browse.querySelector('yt-page-header-renderer yt-dynamic-text-view-model h1 span')?.textContent;
	const channelNick = browse.querySelector('yt-page-header-renderer yt-content-metadata-view-model .yt-core-attributed-string span')?.textContent;

	// console.log('test: channelName = ', channelName);
	// console.log('test: channelNick = ', channelNick);

	if (channelName && channelNick) {
		blackListChannels.forEach(blackChannel => {
            // start with from 1 because always in href value is /@something
            if (channelNick?.startsWith(blackChannel)) {
				replace(browse);
				console.log('test: replaced channel with nick = ', channelNick);
				return;
            }
        })

		if (channelName) {
			const splited = channelName?.toLocaleLowerCase().split(' ');
			for (let i = 0; i < blackListWords.length; i++) {
				var result = splited?.some((w) => {
					return w.includes(blackListWords[i]?.toLocaleLowerCase())
				})
	
				if (result) {
					replace(browse);
					console.log('test: replaced channel with channelName = ', channelName);
					return;
				}
			}

			for (let i = 0; i < blackListPhrases.length; i++) {
				var result = channelName?.includes(blackListPhrases[i])
		
				if (result) {
					replace(browse);
					console.log('test: replaced channel with channelName = ', channelName);
					return;
				}
			}
		}
	}
    // const firstItemContentsItems = browse?.querySelectorAll(':scope > *');
    // console.log('test: browse = ', browse);
    // console.log('test: firstItemContentsItems = ', firstItemContentsItems);
    
})




function replace(browse: Element) {

	var t = document.createElement('template');
	t.innerHTML = blackListProhibitiveElement;

	browse.replaceWith(t.content);
	//(window as any).browseRuchit = browse?.querySelectorAll(':scope > *');
	// if ((window as any).channelMutation) {
	// 	(window as any).channelMutation.disconnect()
	// }

	// (window as any).channelMutation = new MutationObserver(records => {
	// 	records.forEach(record => {
	// 		record.addedNodes.forEach(node => {
	// 			let html = node as HTMLElement;
	// 			html.remove();
	// 		})
	// 	})
	// })
	// const header = browse?.querySelector('#header');
	// const resultRender = browse?.querySelector('ytd-two-column-browse-results-renderer ytd-section-list-renderer > #contents');

	// console.log('test: resultRender = ', resultRender);
	// const items = browse?.querySelectorAll(':scope > *');

	// console.log('test: items = ', items);
	
	// if (items) {
	// 	items?.forEach(item => {
	// 		item.remove();
	// 	})
	// }

	// // resultRender?.remove()
	// // header?.remove()

	// // (window as any).channelMutation.observe(resultRender, {
	// // 	childList: true
	// // })
	// if (browse) {
	// 	browse.innerHTML = test;
	// }
}