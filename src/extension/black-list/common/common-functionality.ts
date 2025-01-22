import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_PHRASES, STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON } from "src/app/shared/constants";
import { BlackListData } from "../black-list-models";

export async function getBlackListData(): Promise<BlackListData> {
    const storageKeysData = []

    const storageKeysTurnedOn = [
        STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
        STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
        STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON
    ]

    var storageTurningOn = await chrome.storage.sync.get(storageKeysTurnedOn);

    //depend on storageKeysTurnedOn black list will be loaded or not
    if (storageTurningOn[STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON]) {
        storageKeysData.push(STORAGE_BLACKLIST_CHANNELS)
    }

    if (storageTurningOn[STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON]) {
        storageKeysData.push(STORAGE_BLACKLIST_KEYWORDS)
    }

    if (storageTurningOn[STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON]) {
        storageKeysData.push(STORAGE_BLACKLIST_PHRASES)
    }
    
    const storageBlackLists = await chrome.storage.sync.get(storageKeysData);
    const data: BlackListData = {
        blackListChannels: storageBlackLists[STORAGE_BLACKLIST_CHANNELS] ?? [],
        blackListWords: storageBlackLists[STORAGE_BLACKLIST_KEYWORDS] ?? [],
        blackListPhrases: storageBlackLists[STORAGE_BLACKLIST_PHRASES] ?? []
    }

    return data;
}