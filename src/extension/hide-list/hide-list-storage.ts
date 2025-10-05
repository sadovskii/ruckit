import { HideListItemType } from "src/app/settings/layout-content/hide-list/hide-list.models";
import { HIDE_LIST_ID } from 'src/app/shared/constants';

export class HideListStorage {
    hideListMap = new Map<HideListItemType, boolean>();

    async init(): Promise<void> {
        let hidelistResult = await chrome.storage.sync.get(HIDE_LIST_ID);

        this.hideListMap = new Map(hidelistResult[HIDE_LIST_ID]);
    }

    async initUpdateHandler() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== "sync") return;

            if (this.updateProperty(HIDE_LIST_ID, changes, t => this.hideListMap = new Map(t))) {
                return;
            };
        });
    }

    public get generalShorts(): boolean {
        return this.hideListMap.get(HideListItemType.GeneralHideShorts) ?? false;
    }

    public async addHideListItem(type: HideListItemType) {
        this.hideListMap.set(type, true);
        await this.storageSyncSetMap(HIDE_LIST_ID, this.hideListMap);
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

    async storageSyncSetMap(key: string, map: Map<any, any>): Promise<void> {
        let data: { [key: string]: any } = {};
        data[key] = Array.from(map);
        return await chrome.storage.sync.set(data);
    };
}