import { BlackListStorage } from "./black-list/black-list-storage";

const youtube = 'https://www.youtube.com/'
const search = 'https://www.youtube.com/results'

console.log("background works!");

chrome.action.onClicked.addListener(() => {
    console.log("click");
});

// chrome.action.onClicked.addListener(async (tab) => {
//     // let queryOptions = { url: 'chrome-extension://mpnfelmoifonibdccihkjlkhialilnjf/settings/settings.html' };
//     // let tabs: chrome.tabs.Tab[] = await chrome.tabs.query(queryOptions);

//     // if (tabs && tabs.length > 0) {
//     //     var updateProperties = { 'active': true };
//     //     if (tabs[0].id) {
//     //         chrome.tabs.update(tabs[0].id, updateProperties, (tab) => { });
//     //     }
//     // }
//     // else {
//     //     let tab1 = chrome.tabs.create({
//     //         url: 'settings/settings.html'
//     //       });
//     // }
// });

// chrome.tabs.onUpdated.addListener(async (tabActiveId, changeInfo, tab) => {
//     if (changeInfo.url) {
//         console.log('changeInfo = ', changeInfo);
//         if (tab.url && tab.url?.startsWith(youtube)) {
//             for (let i = 0; i < BlackListStorage.blackChannels.length; i++) {
//                 if (tab.url?.includes(BlackListStorage.blackChannels[i])) {
//                     await chrome.tabs.update({
//                         url: youtube
//                     })
//                 }
//             }
//         }
//     }

    
//     if (changeInfo.url) {
//         console.log('before reload', changeInfo);
//         if (tab.url && tab.url?.startsWith(search) && tab.id) {
//             setTimeout(() => {
//                 if (tab.id) {
//                     chrome.tabs.reload(tab.id);
//                 }
                
//             }, 1000)
//         }
//     }
// })
