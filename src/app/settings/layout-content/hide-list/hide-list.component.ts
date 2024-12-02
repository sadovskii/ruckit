import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HideListItemGroupType, HideListItemModel, HideListItemType, HideListModel } from './hide-list.models';
import { HideListModelConfiguration } from './hide-list.configuration';
import { from, Subscription } from 'rxjs';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { HIDE_LIST_ID } from 'src/app/shared/constants';
import { GlobalService } from 'src/app/shared/services/global/global.service';

@Component({
  selector: 'app-hide-list',
  templateUrl: './hide-list.component.html',
  styleUrls: ['./hide-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HideListComponent implements OnInit, OnDestroy {
  public HideListItemType = HideListItemType;
  public HideListItemGroupType = HideListItemGroupType;
  public IsRestricted: boolean | undefined = undefined;
  
  public hideListItemMap = new Map<HideListItemType, boolean>();
  public HideListConfiguration: HideListModel;
  private _subscriptions = new Subscription();
  
  constructor(
    private _chromeService: ChromeService,
    private _globalService: GlobalService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    let sub = this._chromeService.storageSyncGetItem(HIDE_LIST_ID).subscribe(t => {
      const map = t[HIDE_LIST_ID];
      if (map) {
        this.hideListItemMap = new Map<HideListItemType, boolean>(map);
        this.HideListConfiguration = HideListModelConfiguration(this.hideListItemMap);
      }
      else {
        this.HideListConfiguration = HideListModelConfiguration(this.hideListItemMap);
      }
      this.IsRestricted = this._globalService.getIsRestrictedValue();
      console.log('IsRestricted = ', this.IsRestricted);
      this._cdr.detectChanges();
    })

    this._subscriptions.add(sub);

    sub = this._globalService.getIsRestricted$().subscribe(t => {
      this.IsRestricted = t;
      this._cdr.detectChanges();
    })

    this._subscriptions.add(sub);
  }

  updateHideList(groupType: HideListItemGroupType, item: HideListItemModel) {

    if (item.value) {
      this._chromeService.insertCssToYoutube(item.cssUrl);
      
      let sub = this._chromeService.addCssContentScriptOrUpdateExist(
        HIDE_LIST_ID,
        [item.cssUrl]
      ).subscribe();

      this.hideListItemMap.set(item.type, item.value);
      this._subscriptions.add(sub);

      sub = this._chromeService.storageSyncSetMap(HIDE_LIST_ID, this.hideListItemMap).subscribe();
      this._subscriptions.add(sub);
    }
    else {
      this._chromeService.removeCssToYoutube(item.cssUrl);
      let sub = this._chromeService.removeCssContentScript(
        HIDE_LIST_ID,
        item.cssUrl
      ).subscribe();

      this._subscriptions.add(sub);

      this.hideListItemMap.set(item.type, item.value ?? false);
      sub = this._chromeService.storageSyncSetMap(HIDE_LIST_ID, this.hideListItemMap).subscribe();

      this._subscriptions.add(sub);
    }
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
