import { Component, OnDestroy, OnInit } from '@angular/core';
import { first, pipe, Subscription, take } from 'rxjs';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { BlackListRestrictionType, Dictionary } from './black-list.models';
import { NbDialogService } from '@nebular/theme';
import { BlackListManageRestrictionsComponent } from './black-list-manage-restrictions/black-list-manage-restrictions.component';
import { BACKDROP_CLASS, STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-black-list',
  templateUrl: './black-list.component.html',
  styleUrls: ['./black-list.component.scss']
})
export class BlackListComponent implements OnInit, OnDestroy {
  public isRestricted: boolean;
  public BlackListRestrictionType = BlackListRestrictionType;

  protected blackListData: Dictionary = {
    channel: [],
    phrase: [],
    keyword: []
  }

  private _subscription = new Subscription();

  constructor(
    private _globalService: GlobalService,
    private _dialogService: NbDialogService,
    private _chromeService: ChromeService) {}

  ngOnInit(): void {
    this._initIsRestricted();
    this._initBlackListCounts();
  }

  onManageRestrictionClick(type: BlackListRestrictionType) {
    this.blackListData[type] = this._sortAlphabetically(this.blackListData[type]);

    const ref = this._dialogService.open(BlackListManageRestrictionsComponent, {
      hasBackdrop: true,
      autoFocus: false,
      backdropClass: BACKDROP_CLASS,
      context: {
        type: type,
        restrictionList: this.blackListData[type],
      }
    })

    const addItemSub = ref.componentRef.instance.addItem.subscribe(t => {
      this.onAddItem(t, type);
    });

    const removeItemSub = ref.componentRef.instance.removeItem.subscribe(item => {
      this.onRemoveItem(item, type);
    })

    addItemSub.add(removeItemSub);

    const sub = ref.onClose.pipe(first()).subscribe(t => {
      addItemSub.unsubscribe();
    });

    this._subscription.add(sub);
  }

  onAddItem(item: string, type: BlackListRestrictionType) {
    const list = this.blackListData[type];
    list.push(item);
    this._setListToStorage(list, type);
  }

  onRemoveItem(index: number, type: BlackListRestrictionType) {
    const list = this.blackListData[type];
    list.splice(index, 1);
    this._setListToStorage(list, type);
  }

  private _setListToStorage(list: string[], type: BlackListRestrictionType) {
    switch(type) {
      case BlackListRestrictionType.Channels: {
        this._chromeService.storageSyncSet<string[]>(STORAGE_BLACKLIST_CHANNELS, list)
          .pipe(first())
          .subscribe();
        break;
      }
      case BlackListRestrictionType.Keywords: {
        this._chromeService.storageSyncSet<string[]>(STORAGE_BLACKLIST_KEYWORDS, list)
          .pipe(first())
          .subscribe();
        break;
      }
      default: {
        this._chromeService.storageSyncSet<string[]>(STORAGE_BLACKLIST_PHRASES, list)
          .pipe(first())
          .subscribe();
      }
    }
  }

  private _initIsRestricted() {
    const sub = this._globalService.getIsRestricted$.subscribe(storedIsRestricted => {
      this.isRestricted = storedIsRestricted;
    })

    this._subscription.add(sub);
  }

  private _initBlackListCounts() {
    const counts = [
      STORAGE_BLACKLIST_CHANNELS,
      STORAGE_BLACKLIST_KEYWORDS,
      STORAGE_BLACKLIST_PHRASES
    ]
  
    this._chromeService.storageSyncGetItems(counts).subscribe(t => {
      this.blackListData[BlackListRestrictionType.Channels] = t[STORAGE_BLACKLIST_CHANNELS] ?? [];
      this.blackListData[BlackListRestrictionType.Keywords] = t[STORAGE_BLACKLIST_KEYWORDS] ?? [];
      this.blackListData[BlackListRestrictionType.Phrases] = t[STORAGE_BLACKLIST_PHRASES] ?? [];
    })
  }

  private _sortAlphabetically(list: string[]): string[] {
    console.log('list = ', list);
    return list.sort((first, second) => {
      var firstLowerCase = first?.toLowerCase(), secondLowerCase = second?.toLowerCase();
      if (firstLowerCase < secondLowerCase) //sort string ascending
       return -1;
      if (firstLowerCase > secondLowerCase)
       return 1;
      return 0; //default return value (no sorting)
     })
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
