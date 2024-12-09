import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HideListItemGroupType, HideListItemModel, HideListItemType, HideListModel } from './hide-list.models';
import { HideListModelConfiguration } from './hide-list.configuration';
import { from, Subscription, switchMap } from 'rxjs';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { BACKDROP_CLASS, HIDE_LIST_ID, STORAGE_PASSWORD_ID } from 'src/app/shared/constants';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { RuckitSnackBarService, SnackbarActionType } from 'src/app/shared/components/ruckit-snack-bar/ruckit-snack-bar.service';
import { NbDialogService } from '@nebular/theme';
import { EnterPasswordComponent } from '../password/enter-password/enter-password.component';

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
    private _cdr: ChangeDetectorRef,
    private _snackbarService: RuckitSnackBarService,
    private _dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this._initHideListConfiguration();
    this._initIsRestricted();
    this._initSnackbarAction();
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

  onRestrictedClickAttempt() {
    this._snackbarService.restricted();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private _initHideListConfiguration() {
    let sub = this._chromeService.storageSyncGetItem(HIDE_LIST_ID).subscribe(map => {

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
    let sub = this._globalService.getIsRestricted$().subscribe(t => {
      this.IsRestricted = t;
      this._cdr.detectChanges();
    })

    this._subscriptions.add(sub);
  }

  private _initSnackbarAction() {
    const sub = this._snackbarService.action$().subscribe(t => {
      console.log('_initSnackbarAction');
      if (t === SnackbarActionType.enterPassword) {
        this._initEnterPassword();
      }
    });

    this._subscriptions.add(sub);
  }

  private _initEnterPassword() {
    const ref = this._dialogService.open(EnterPasswordComponent,
      {
        hasBackdrop: true,
        autoFocus: false,
        backdropClass: BACKDROP_CLASS
      }
    );

    let sub = ref.componentRef.instance.submit.pipe(
      ).subscribe(_ => {
        this._globalService.setIsPasswordFreeSession$(true);
          this._cdr.detectChanges();
      })

    this._subscriptions.add(sub);
  }
}
