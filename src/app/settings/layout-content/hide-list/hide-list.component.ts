import { Component, OnInit } from '@angular/core';
import { HideListItemGroupType, HideListItemModel, HideListItemType, HideListModel } from './hide-list.models';
import { HideListModelConfiguration } from './hide-list.configuration';
import { from } from 'rxjs';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { HIDE_LIST_ID } from 'src/app/shared/constants';

@Component({
  selector: 'app-hide-list',
  templateUrl: './hide-list.component.html',
  styleUrls: ['./hide-list.component.scss']
})
export class HideListComponent implements OnInit {
  public HideListItemType = HideListItemType;
  public HideListItemGroupType = HideListItemGroupType;
  
  public hideListItemMap = new Map<HideListItemType, boolean>();
  public HideListConfiguration: HideListModel
  
  constructor(private _chromeService: ChromeService) {}

  ngOnInit(): void {
    this._chromeService.storageSyncGetItem(HIDE_LIST_ID).subscribe(t => {
      const map = t[HIDE_LIST_ID];
      if (map) {
        this.hideListItemMap = new Map<HideListItemType, boolean>(map);
        this.HideListConfiguration = HideListModelConfiguration(this.hideListItemMap);
      }
      else {
        this.HideListConfiguration = HideListModelConfiguration(this.hideListItemMap);
      }
    })
  }

  updateHideList(groupType: HideListItemGroupType, item: HideListItemModel) {
    this._chromeService.storageSyncGetBytesInUse(HIDE_LIST_ID)

    if (item.value) {
      this._chromeService.insertCssToYoutube(item.cssUrl);
      this._chromeService.addCssContentScriptOrUpdateExist(
        HIDE_LIST_ID,
        [item.cssUrl]
      ).subscribe();

      this.hideListItemMap.set(item.type, item.value);

      this._chromeService.storageSyncSetMap(HIDE_LIST_ID, this.hideListItemMap).subscribe();
    }
    else {
      this._chromeService.removeCssToYoutube(item.cssUrl);
      this._chromeService.removeCssContentScript(
        HIDE_LIST_ID,
        item.cssUrl
      ).subscribe();

      this.hideListItemMap.set(item.type, item.value ?? false);
      this._chromeService.storageSyncSetMap(HIDE_LIST_ID, this.hideListItemMap).subscribe();
    }
  }
}
