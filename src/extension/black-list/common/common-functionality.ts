import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, LEGACY_STORAGE_BLACKLIST_PHRASES, LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON } from "src/app/shared/constants";
import { BlackListData } from "../black-list-models";
import { mergeUniqueKeywords } from "./keyword-matching";

export async function getBlackListData(): Promise<BlackListData> {
    const storageKeysData = []

    const storageKeysTurnedOn = [
        STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
        STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
        LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON
    ]

    var storageTurningOn = await chrome.storage.sync.get(storageKeysTurnedOn);

    //depend on storageKeysTurnedOn black list will be loaded or not
    if (storageTurningOn[STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON]) {
        storageKeysData.push(STORAGE_BLACKLIST_CHANNELS)
    }

    if (storageTurningOn[STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON]) {
        storageKeysData.push(STORAGE_BLACKLIST_KEYWORDS)
    }

    // phrases were merged into keywords; read the legacy list in case it hasn't been migrated yet
    if (storageTurningOn[LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON]) {
        storageKeysData.push(LEGACY_STORAGE_BLACKLIST_PHRASES)
    }
    
    const storageBlackLists = await chrome.storage.sync.get(storageKeysData);
    const data: BlackListData = {
        blackListChannels: storageBlackLists[STORAGE_BLACKLIST_CHANNELS] ?? [],
        blackListWords: mergeUniqueKeywords(storageBlackLists[STORAGE_BLACKLIST_KEYWORDS], storageBlackLists[LEGACY_STORAGE_BLACKLIST_PHRASES])
    }

    return data;
}