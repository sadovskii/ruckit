import { BlackListDictionary, BlackListRestrictionType, blackListRestrictionTypeToStoreMap, blackListRestrictionTypeToStoreTurnOnMap } from "src/app/settings/layout-content/black-list/black-list.models";
import { STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON, STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";

export class BlackListStorage {

    public get channelIsTurnedOn(): boolean { return this.blackListTurningOn[BlackListRestrictionType.Channels]; }
    public get channels(): string[] { return this.blackListData[BlackListRestrictionType.Channels]; }
    public channelMap: Map<string, boolean> = new Map(); // name, nickname

    public get keywordsIsTurnedOn(): boolean { return this.blackListTurningOn[BlackListRestrictionType.Keywords]; }
    public get keywords(): string[] { return this.blackListData[BlackListRestrictionType.Keywords]; }

    public get phrasesIsTurnedOn(): boolean { return this.blackListTurningOn[BlackListRestrictionType.Phrases]; }
    public get phrases(): string[] { return this.blackListData[BlackListRestrictionType.Phrases]; }

    private blackListData: BlackListDictionary<string[]> = {
        channel: [],
        phrase: [],
        keyword: []
    }
    
    private blackListTurningOn: BlackListDictionary<boolean> = {
        channel: false,
        phrase: true,
        keyword: false
    }

    async init(): Promise<void> {
        const storageKeysData = []
    
        const storageKeysTurnedOn = [
            STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
            STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
            STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON
        ]
    
        var storageTurningOn = await chrome.storage.sync.get(storageKeysTurnedOn);
    
        this.blackListTurningOn[BlackListRestrictionType.Channels] = storageTurningOn[STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON];
        if (this.blackListTurningOn[BlackListRestrictionType.Channels]) {
            storageKeysData.push(STORAGE_BLACKLIST_CHANNELS);
        }
    
        this.blackListTurningOn[BlackListRestrictionType.Keywords] = storageTurningOn[STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON];
        if (this.blackListTurningOn[BlackListRestrictionType.Keywords]) {
            storageKeysData.push(STORAGE_BLACKLIST_KEYWORDS)
        }
    
        this.blackListTurningOn[BlackListRestrictionType.Phrases] = storageTurningOn[STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON];
        if (this.blackListTurningOn[BlackListRestrictionType.Phrases]) {
            storageKeysData.push(STORAGE_BLACKLIST_PHRASES)
        }
        
        const storageBlackLists = await chrome.storage.sync.get(storageKeysData);

        this.blackListData[BlackListRestrictionType.Channels] = storageBlackLists[STORAGE_BLACKLIST_CHANNELS] ?? [];
        this.blackListData[BlackListRestrictionType.Keywords] = storageBlackLists[STORAGE_BLACKLIST_KEYWORDS] ?? [];
        this.blackListData[BlackListRestrictionType.Phrases] = storageBlackLists[STORAGE_BLACKLIST_PHRASES] ?? [];

        this.channelMap = new Map(this.blackListData[BlackListRestrictionType.Channels].map(item => [item, true]));

        console.log("this.blackListData = ", this.blackListData);
        console.log("this.blackListTurningOn = ", this.blackListTurningOn);
    }

    public initHandler() {
        this.handler();
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

    private handler() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== "sync") return;

            if (this.updateProperty(STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, changes,t => {
                this.blackListTurningOn[BlackListRestrictionType.Channels] = t;
            })) return;
            if (this.updateProperty(STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, changes, t => {
                this.blackListTurningOn[BlackListRestrictionType.Keywords] = t
            })) return;
            if (this.updateProperty(STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON, changes, t => {
                this.blackListTurningOn[BlackListRestrictionType.Phrases] = t
            })) return;

            if (this.updateProperty(STORAGE_BLACKLIST_CHANNELS, changes, t => 
                {
                    this.blackListData[BlackListRestrictionType.Channels] = t;

                    console.log('before map = ', this.blackListData[BlackListRestrictionType.Channels]);

                    this.channelMap = new Map(this.blackListData[BlackListRestrictionType.Channels].map(item => [item, true]));
                })) return;
            if (this.updateProperty(STORAGE_BLACKLIST_KEYWORDS, changes, t => {
                this.blackListData[BlackListRestrictionType.Keywords] = t
            })) return;
            if (this.updateProperty(STORAGE_BLACKLIST_PHRASES, changes, t => {
                this.blackListData[BlackListRestrictionType.Phrases] = t
            })) return;
        });
    }

    private updateProperty(key: string, changes: any, setter: (val: any) => void) {
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
