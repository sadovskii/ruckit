import { Injectable } from "@angular/core";
import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES, STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES_IS_TURNED_ON } from "src/app/shared/constants";
import { BlackListStorage } from "src/extension/black-list/black-list-storage";
import { BlackListRestrictionType } from "./black-list.models";
import { Observable, Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class BlackListStorageService extends BlackListStorage {

    public handler$ = new Subject<string>();

    public addHandler(): Observable<string> {
        chrome.storage.onChanged.addListener(this._handlerListener);

        return this.handler$.asObservable();
    }

    public removeHandler() {
        chrome.storage.onChanged.removeListener(this._handlerListener);
    }

    private _handlerListener = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string
    ) => {
        if (areaName !== "sync") return;

        if (super.updateProperty(STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, changes,t => {
            this.blackListTurningOn[BlackListRestrictionType.Channels] = t;
            this.handler$.next(STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON);
        })) return;
        if (this.updateProperty(STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES_IS_TURNED_ON, changes, t => {
            this.blackListTurningOn[BlackListRestrictionType.KeywordsAndPhrases] = t;
            this.handler$.next(STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES_IS_TURNED_ON);
        })) return;

        if (this.updateProperty(STORAGE_BLACKLIST_CHANNELS, changes, t =>
            {
                this.blackListData[BlackListRestrictionType.Channels] = t;
                this.channelMap = new Map(this.blackListData[BlackListRestrictionType.Channels].map(item => [item, true]));
                
                this.handler$.next(STORAGE_BLACKLIST_CHANNELS);
            })) return;
        if (this.updateProperty(STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES, changes, t => {
            this.blackListData[BlackListRestrictionType.KeywordsAndPhrases] = t;
            this.handler$.next(STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES);
        })) return;
    }
}