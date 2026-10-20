import { BlackListDictionary, BlackListRestrictionType, blackListRestrictionTypeToStoreMap, blackListRestrictionTypeToStoreTurnOnMap } from "src/app/settings/layout-content/black-list/black-list.models";
import { STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, LEGACY_STORAGE_BLACKLIST_PHRASES, LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON } from "src/app/shared/constants";
import { matchesBlackListKeyword, mergeUniqueKeywords } from "./common/keyword-matching";

interface MergedKeywords {
    keywords: string[];
    isTurnedOn: boolean;
}

/**
 * Merges the legacy phrases list into keywords.
 * The merged list is on when keywords were on, or when phrases were on and actually contained items,
 * so every item that was hiding content before keeps hiding it.
 */
function mergeLegacyPhrasesIntoKeywords(stored: Record<string, any>): MergedKeywords {
    const legacyPhrases: string[] = Array.isArray(stored[LEGACY_STORAGE_BLACKLIST_PHRASES]) ? stored[LEGACY_STORAGE_BLACKLIST_PHRASES] : [];
    const keywords = mergeUniqueKeywords(stored[STORAGE_BLACKLIST_KEYWORDS], legacyPhrases);
    const isTurnedOn = !!stored[STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON]
        || (!!stored[LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON] && legacyPhrases.length > 0);

    return { keywords, isTurnedOn };
}

/**
 * One-time, idempotent migration of the legacy phrases list into the keywords list in sync storage.
 * Legacy keys are removed only after the merged data was saved successfully.
 */
export async function migrateLegacyPhrasesToKeywords(): Promise<void> {
    try {
        const stored = await chrome.storage.sync.get([
            STORAGE_BLACKLIST_KEYWORDS,
            STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
            LEGACY_STORAGE_BLACKLIST_PHRASES,
            LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON
        ]);

        if (!(LEGACY_STORAGE_BLACKLIST_PHRASES in stored) && !(LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON in stored)) {
            return;
        }

        const merged = mergeLegacyPhrasesIntoKeywords(stored);

        // separate set calls: storage change handlers process only one key per change event
        await chrome.storage.sync.set({ [STORAGE_BLACKLIST_KEYWORDS]: merged.keywords });
        await chrome.storage.sync.set({ [STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON]: merged.isTurnedOn });
        await chrome.storage.sync.remove([LEGACY_STORAGE_BLACKLIST_PHRASES, LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON]);
    }
    catch (error) {
        console.error('black-list: failed to migrate phrases into keywords', error);
    }
}

export class BlackListStorage {

    public get channelIsTurnedOn(): boolean { return this.blackListTurningOn[BlackListRestrictionType.Channels]; }
    public get channels(): string[] { return this.blackListData[BlackListRestrictionType.Channels]; }
    public channelMap: Map<string, boolean> = new Map(); // name, nickname

    public get keywordsIsTurnedOn(): boolean { return this.blackListTurningOn[BlackListRestrictionType.Keywords]; }
    public get keywords(): string[] { return this.blackListData[BlackListRestrictionType.Keywords]; }

    protected blackListData: BlackListDictionary<string[]> = {
        channel: [],
        keyword: []
    }
    
    protected blackListTurningOn: BlackListDictionary<boolean> = {
        channel: false,
        keyword: false
    }

    async init(): Promise<void> {
        const storageKeysData = [
            STORAGE_BLACKLIST_CHANNELS,
            STORAGE_BLACKLIST_KEYWORDS,
            LEGACY_STORAGE_BLACKLIST_PHRASES
        ]
    
        const storageKeysTurnedOn = [
            STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
            STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
            LEGACY_STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON
        ]
    
        var storageTurningOn = await chrome.storage.sync.get(storageKeysTurnedOn);
        const storageBlackLists = await chrome.storage.sync.get(storageKeysData);

        // merging in memory too, in case the storage migration hasn't finished yet
        const mergedKeywords = mergeLegacyPhrasesIntoKeywords({ ...storageTurningOn, ...storageBlackLists });

        this.blackListTurningOn[BlackListRestrictionType.Channels] = storageTurningOn[STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON];
        this.blackListTurningOn[BlackListRestrictionType.Keywords] = mergedKeywords.isTurnedOn;

        this.blackListData[BlackListRestrictionType.Channels] = storageBlackLists[STORAGE_BLACKLIST_CHANNELS] ?? [];
        this.blackListData[BlackListRestrictionType.Keywords] = mergedKeywords.keywords;

        this.channelMap = new Map(this.blackListData[BlackListRestrictionType.Channels].map(item => [item, true]));
    }

    public matchesKeyword(text: string | null | undefined): boolean {
        return matchesBlackListKeyword(text, this.keywords);
    }


    public setBlackListChannel(channelName: string | undefined): void {
        if (!channelName) return;
        if (this.channels.includes(channelName)) return;

        this.channels.push(channelName);

        chrome.storage.sync.set({[STORAGE_BLACKLIST_CHANNELS]: this.channels });
    }

    public addBlackListItem(item: string | undefined, type: BlackListRestrictionType): void {
        if (!item) return;
        if (this.blackListData[type].includes(item)) return;

        this.blackListData[type].push(item);

        const storeType = blackListRestrictionTypeToStoreMap[type];

        chrome.storage.sync.set({[storeType]: this.blackListData[type] });
    }

    public removeBlackListItem(index: number, type: BlackListRestrictionType): void {
        
        this.blackListData[type].splice(index, 1);
        const storeType = blackListRestrictionTypeToStoreMap[type];

        chrome.storage.sync.set({[storeType]: this.blackListData[type] });
    }

    public setBlackListTutnedOn(bool: boolean, type: BlackListRestrictionType) {
        const storeType = blackListRestrictionTypeToStoreTurnOnMap[type];

        chrome.storage.sync.set({[storeType]: bool });
    }

    public initHandler() {
        this.handler();
    }

    protected handler() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== "sync") return;

            if (this.updateProperty(STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, changes,t => {
                this.blackListTurningOn[BlackListRestrictionType.Channels] = t;
            })) return;
            if (this.updateProperty(STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, changes, t => {
                this.blackListTurningOn[BlackListRestrictionType.Keywords] = t
            })) return;

            if (this.updateProperty(STORAGE_BLACKLIST_CHANNELS, changes, t => 
                {
                    this.blackListData[BlackListRestrictionType.Channels] = t;
                    this.channelMap = new Map(this.blackListData[BlackListRestrictionType.Channels].map(item => [item, true]));
                })) return;
            if (this.updateProperty(STORAGE_BLACKLIST_KEYWORDS, changes, t => {
                this.blackListData[BlackListRestrictionType.Keywords] = t
            })) return;
        });
    }

    protected updateProperty(key: string, changes: any, setter: (val: any) => void) {
        if (key in changes) {
            const { oldValue, newValue } = changes[key];

            if (newValue != null) {
                setter(newValue);
                return true;
            }
        }

        return false;
    }
}
