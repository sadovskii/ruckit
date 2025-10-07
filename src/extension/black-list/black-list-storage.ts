import { BlackListDictionary2, BlackListRestriction2Type, BlackListRestrictionType } from "src/app/settings/layout-content/black-list/black-list.models";
import { STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON, STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";

export class BlackListStorage {

    public channelIsTurnedOn: boolean = false;
    public channels: string[] = [];
    public channelMap: Map<string, boolean> = new Map(); // name, nickname

    public keywordsIsTurnedOn: boolean = false;
    public keywords: string[] = [];

    public phrasesIsTurnedOn: boolean = false;
    public phrases: string[] = [];

    protected blackListData: BlackListDictionary2<string[]> = {
        blch: [],
        blph: [],
        blk: []
    }
    
    protected blackListTurningOn: BlackListDictionary2<boolean> = {
        blch: false,
        blph: false,
        blk: false
    }

    async init(): Promise<void> {
        const storageKeysData = []
    
        const storageKeysTurnedOn = [
            STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
            STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
            STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON
        ]
    
        var storageTurningOn = await chrome.storage.sync.get(storageKeysTurnedOn);
    
        this.channelIsTurnedOn = storageTurningOn[STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON];
        if (this.channelIsTurnedOn) {
            storageKeysData.push(STORAGE_BLACKLIST_CHANNELS);
        }
    
        this.keywordsIsTurnedOn = storageTurningOn[STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON];
        if (this.keywordsIsTurnedOn) {
            storageKeysData.push(STORAGE_BLACKLIST_KEYWORDS)
        }
    
        this.phrasesIsTurnedOn = storageTurningOn[STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON];
        if (this.phrasesIsTurnedOn) {
            storageKeysData.push(STORAGE_BLACKLIST_PHRASES)
        }
        
        const storageBlackLists = await chrome.storage.sync.get(storageKeysData);

        this.channels = storageBlackLists[STORAGE_BLACKLIST_CHANNELS] ?? [];
        this.keywords = storageBlackLists[STORAGE_BLACKLIST_KEYWORDS] ?? [];
        this.phrases = storageBlackLists[STORAGE_BLACKLIST_PHRASES] ?? [];

        this.channelMap = new Map(this.channels.map(item => [item, true]));
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

    public setBlackListItem(item: string | undefined, type: BlackListRestriction2Type): void {
        if (!item) return;
        if (this.blackListData[type].includes(item)) return;

        this.channels.push(item);

        chrome.storage.sync.set({[type]: this.channels });
    }

    private handler() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== "sync") return;

            if (this.updateProperty(STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, changes, t => this.channelIsTurnedOn = t)) return;
            if (this.updateProperty(STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, changes, t => this.keywordsIsTurnedOn = t)) return;
            if (this.updateProperty(STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON, changes, t => this.phrasesIsTurnedOn = t)) return;

            if (this.updateProperty(STORAGE_BLACKLIST_CHANNELS, changes, t => 
                {
                    this.channels = t;
                    this.channelMap = new Map(this.channels.map(item => [item, true]));
                })) return;
            if (this.updateProperty(STORAGE_BLACKLIST_KEYWORDS, changes, t => this.keywords = t)) return;
            if (this.updateProperty(STORAGE_BLACKLIST_PHRASES, changes, t => this.phrases = t)) return;
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
