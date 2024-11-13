import { BlackListStorage } from "./black-list/black-list-storage";

const youtube = 'https://www.youtube.com/'
const search = 'https://www.youtube.com/results'

console.log("background works test 1111!");

chrome.tabs.onUpdated.addListener(async (tabActiveId, changeInfo, tab) => {
    if (changeInfo.url) {
        console.log('changeInfo = ', changeInfo);
        if (tab.url && tab.url?.startsWith(youtube)) {
            for (let i = 0; i < BlackListStorage.blackChannels.length; i++) {
                if (tab.url?.includes(BlackListStorage.blackChannels[i])) {
                    await chrome.tabs.update({
                        url: youtube
                    })
                }
            }
        }
    }

    
    if (changeInfo.url) {
        console.log('before reload', changeInfo);
        if (tab.url && tab.url?.startsWith(search) && tab.id) {
            setTimeout(() => {
                if (tab.id) {
                    chrome.tabs.reload(tab.id);
                }
                
            }, 1000)
        }
    }
})
