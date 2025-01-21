import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HideListItemGroupType, HideListItemModel, HideListItemType, HideListModel } from './hide-list.models';
import { HideListModelConfiguration } from './hide-list.configuration';
import { Subscription } from 'rxjs';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { HIDE_LIST_ID } from 'src/app/shared/constants';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { ViewVersions } from 'src/app/shared/types';

@Component({
  selector: 'app-hide-list',
  templateUrl: './hide-list.component.html',
  styleUrls: ['./hide-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HideListComponent implements OnInit, OnDestroy {
  @Input()
  public viewVersion: ViewVersions = ViewVersions.large;

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
    this._initHideListConfiguration();
    this._initIsRestricted();
  }

  updateHideList(groupType: HideListItemGroupType, item: HideListItemModel) {
    console.log("updateHideList. item = ", item);
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

  
  private _initHideListConfiguration() {
    let sub = this._chromeService.storageSyncGetItem(HIDE_LIST_ID).subscribe(map => {
      
      console.log('map = ', map);
      if (map) {
        this.hideListItemMap = new Map<HideListItemType, boolean>(map);
      }
      
      this.HideListConfiguration = HideListModelConfiguration(this.hideListItemMap);
      this.IsRestricted = this._globalService.getIsRestrictedValue();
      console.log('IsRestricted = ', this.IsRestricted);
      this._cdr.detectChanges();
    })
    
    this._subscriptions.add(sub);
  }
  
  private _initIsRestricted() {
    let sub = this._globalService.getIsRestricted$.subscribe(t => {
      this.IsRestricted = t;
      this._cdr.detectChanges();
    })
    
    this._subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
