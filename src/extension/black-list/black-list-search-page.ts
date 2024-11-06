import {BlackListStorage} from "./black-list-storage";

function hideVideos(ytdVideoRenderer: HTMLElement) {
    hideElementsFromBlackListByChannelName(ytdVideoRenderer);
    hideElementsFromBlackListByName(ytdVideoRenderer);
    hideElementsFromBlackListByPhrase(ytdVideoRenderer);
}

function hideElementsFromBlackListByPhrase(ytdVideoRenderer: HTMLElement) {
    var element = ytdVideoRenderer?.querySelector('#video-title') as HTMLElement;
    var name = element?.getAttribute("title")?.toLowerCase();

    for (let i = 0; i < BlackListStorage.blackPhrases.length; i++) {
        var result = name?.includes(BlackListStorage.blackPhrases[i])

        if (result) {
            ytdVideoRenderer.style.display = "none";
            break;
        }
    }
}

function hideElementsFromBlackListByChannelName(ytdVideoRenderer: HTMLElement) {
    var element = ytdVideoRenderer?.querySelector('#channel-thumbnail') as HTMLElement;
    var channelLink = element?.getAttribute("href");

    if (channelLink) {
        BlackListStorage.blackChannels.forEach(blackChannel => {
            if (channelLink?.startsWith(blackChannel, 1)) {
                ytdVideoRenderer.style.display = "none";
            }
        })
    }
}

function hideElementsFromBlackListByName(ytdVideoRenderer: HTMLElement) {
    var element = ytdVideoRenderer?.querySelector('#video-title') as HTMLElement;
    var name = element?.getAttribute("title")?.toLowerCase();

    if (name) {
        const splited = name?.split(' ');
        for (let i = 0; i < BlackListStorage.blackNameWords.length; i++) {
            var result = splited?.some((w) => {
                return w.includes(BlackListStorage.blackNameWords[i])
            })

            if (result) {
                ytdVideoRenderer.style.display = "none";
                break;
            }
        }
    }
}


const subMutationObserver = new MutationObserver(async (entry) => {
    entry?.forEach(element => {
        element.addedNodes?.forEach(node => {
            const html = node as HTMLElement;
            hideVideos(html);
        });
    });
})

const mutationObserver = new MutationObserver(async (entry) => {
    entry?.forEach(element => {
        element.addedNodes?.forEach(node => {

            if (node.nodeName.toLowerCase() === "ytd-item-section-renderer") {
                const htmlNode = node as HTMLElement;

                var videos = Array.from(htmlNode.getElementsByTagName("ytd-video-renderer")  as HTMLCollectionOf<HTMLElement>);
                videos?.forEach(video => {
                    hideVideos(video);
                });

                node.childNodes.forEach(element => {
                    const html = element as HTMLElement
                    console.log(html);
                    if (html.id === "contents") {
                        subMutationObserver.observe(html, { childList: true });
                    }
                });
            }
        });
    });
})

var resultVideos = Array.from(document.getElementsByTagName("ytd-video-renderer")  as HTMLCollectionOf<HTMLElement>);
resultVideos.forEach(element => {
    hideVideos(element);
});

const content = Array.from(document.querySelectorAll("ytd-item-section-renderer #contents") as NodeListOf<HTMLElement>)[0];

if (content) {
    subMutationObserver.observe(content, { 
        childList: true
    });
}

const a = Array.from(document.querySelectorAll("#primary #contents") as NodeListOf<HTMLElement>)[0];

if (a) {
    mutationObserver.observe(a, { 
        childList: true
    });
}
