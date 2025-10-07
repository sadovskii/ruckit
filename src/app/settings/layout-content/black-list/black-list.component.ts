import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { first, of, pipe, Subscription, take } from 'rxjs';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { BlackListRestrictionType, BlackListDictionary2, BlackListDictionary } from './black-list.models';
import { NbDialogService } from '@nebular/theme';
import { BlackListManageRestrictionsComponent } from './black-list-manage-restrictions/black-list-manage-restrictions.component';
import { BACKDROP_CLASS, STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_PHRASES, STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON } from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { ViewVersions } from 'src/app/shared/types';
import { BlackListStorage } from 'src/extension/black-list/black-list-storage';

@Component({
  selector: 'app-black-list',
  templateUrl: './black-list.component.html',
  styleUrls: ['./black-list.component.scss']
})
export class BlackListComponent implements OnInit, OnDestroy {

  @Input()
  public viewVersion: ViewVersions = ViewVersions.large;
  public ViewVersions = ViewVersions;

  @Output()
  public manageRestrictionClick = new EventEmitter();

  public isRestricted: boolean;
  public BlackListRestrictionType = BlackListRestrictionType;


  protected blackListData: BlackListDictionary<string[]> = {
    channel: this._blacklistStorage.channels,
    phrase: this._blacklistStorage.phrases,
    keyword: this._blacklistStorage.keywords
  }

  protected blackListTurningOn: BlackListDictionary<boolean> = {
    channel: this._blacklistStorage.channelIsTurnedOn,
    phrase: this._blacklistStorage.phrasesIsTurnedOn,
    keyword: this._blacklistStorage.keywordsIsTurnedOn
  }

  protected isLoadedIsRestricted: boolean = false;
  protected isLoadedData: boolean = false;

  private _subscription = new Subscription();

  constructor(
    private _globalService: GlobalService,
    private _dialogService: NbDialogService,
    private _chromeService: ChromeService,
    private _cdr: ChangeDetectorRef,
    private _blacklistStorage: BlackListStorage) {}

  ngOnInit(): void {
    this._initIsRestricted();
    this._initBlackListData();
  }

  onManageRestrictionClick(type: BlackListRestrictionType) {
    if (this.viewVersion == ViewVersions.large) {
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

        ref.componentRef.instance.restrictionList = [...this.blackListData[type]];
      });
  
      const removeItemSub = ref.componentRef.instance.removeItem.subscribe(item => {
        this.onRemoveItem(item, type);

        ref.componentRef.instance.restrictionList = [...this.blackListData[type]];
      })
  
      addItemSub.add(removeItemSub);
  
      const sub = ref.onClose.pipe(first()).subscribe(t => {
        addItemSub.unsubscribe();
      });
  
      this._subscription.add(sub);
    }
    else if (this.viewVersion === ViewVersions.small) {
      this.manageRestrictionClick.emit();
    }
  }

  onAddItem(item: string, type: BlackListRestrictionType) {
    
    // hideed adding logic for channels from settings
    if (type === BlackListRestrictionType.Channels) {
      return;
    }

    const list = this.blackListData[type];
    list.push(item);
    this._setListToStorage(list, type);
  }

  onRemoveItem(index: number, type: BlackListRestrictionType) {
    const list = this.blackListData[type];
    list.splice(index, 1);
    this._setListToStorage(list, type);
  }

  onChangeTurningOn(value: boolean, type: BlackListRestrictionType) {
    switch(type) {
      case BlackListRestrictionType.Channels: {
        this._chromeService.storageSyncSet<boolean>(STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, value)
          .pipe(first())
          .subscribe();
        break;
      }
      case BlackListRestrictionType.Keywords: {
        this._chromeService.storageSyncSet<boolean>(STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, value)
          .pipe(first())
          .subscribe();
        break;
      }
      default: {
        this._chromeService.storageSyncSet<boolean>(STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON, value)
          .pipe(first())
          .subscribe();
      }
    }

    chrome.runtime.sendMessage({changeBlackList: true});
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

    chrome.runtime.sendMessage({changeBlackList: true});
  }

  private _initIsRestricted() {
    const sub = this._globalService.getIsRestricted$.subscribe(storedIsRestricted => {
      this.isRestricted = storedIsRestricted;
      this.isLoadedIsRestricted = true;
      this._cdr.detectChanges();
    })

    this._subscription.add(sub);
  }

  private _initBlackListData() {
      of(this._blacklistStorage.init()).subscribe();
      this._blacklistStorage.initHandler();
  }

  private _sortAlphabetically(list: string[]): string[] {
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
