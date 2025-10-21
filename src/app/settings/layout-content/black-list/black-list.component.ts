import { AfterContentInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { first, from, fromEvent, of, pipe, Subscription, take } from 'rxjs';
import { GlobalService } from 'src/app/shared/services/global/global.service';
import { BlackListRestrictionType, BlackListDictionary } from './black-list.models';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { BlackListManageRestrictionsComponent } from './black-list-manage-restrictions/black-list-manage-restrictions.component';
import { BACKDROP_CLASS, STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_PHRASES, STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON } from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { ViewVersions } from 'src/app/shared/types';
import { BlackListStorage } from 'src/extension/black-list/black-list-storage';
import { BlackListStorageService } from './black-list-storage.service';

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

  protected get blackListData() : BlackListDictionary<string[]> {
    return {
      channel: this._blacklistStorage.channels,
      phrase: this._blacklistStorage.phrases,
      keyword: this._blacklistStorage.keywords
    } 
  }

  protected get blackListTurningOn() : BlackListDictionary<boolean> {
    return {
      channel: this._blacklistStorage.channelIsTurnedOn,
      phrase: this._blacklistStorage.phrasesIsTurnedOn,
      keyword: this._blacklistStorage.keywordsIsTurnedOn
    }
  }

  protected isLoadedIsRestricted: boolean = false;
  protected isLoadedData: boolean = false;

  private manageRestrictionsRef: NbDialogRef<BlackListManageRestrictionsComponent>;
  private isChannelRestrictionOpen: boolean;

  private _subscription = new Subscription();

  constructor(
    private _globalService: GlobalService,
    private _dialogService: NbDialogService,
    private _cdr: ChangeDetectorRef,
    private _blacklistStorage: BlackListStorageService) {}

  ngOnInit(): void {
    this._initIsRestricted();
    this._initBlackListData();
    this._cdr.markForCheck();
  }

  onManageRestrictionClick(type: BlackListRestrictionType) {
    if (this.viewVersion == ViewVersions.large) {
      this.blackListData[type] = this._sortAlphabetically(this.blackListData[type]);

      this.manageRestrictionsRef = this._dialogService.open(BlackListManageRestrictionsComponent, {
        hasBackdrop: true,
        autoFocus: false,
        backdropClass: BACKDROP_CLASS,
        context: {
          type: type,
          restrictionList: this.blackListData[type],
        }
      });

      if (type === BlackListRestrictionType.Channels) {
        this.isChannelRestrictionOpen = true;
      }
  
      const addItemSub = this.manageRestrictionsRef.componentRef.instance.addItem.subscribe(t => {
        this.onAddItem(t, type);

        this.manageRestrictionsRef.componentRef.instance.restrictionList = [...this.blackListData[type]];
      });
  
      const removeItemSub = this.manageRestrictionsRef.componentRef.instance.removeItem.subscribe(item => {
        this.onRemoveItem(item, type);

        this.manageRestrictionsRef.componentRef.instance.restrictionList = [...this.blackListData[type]];
      })
  
      addItemSub.add(removeItemSub);
  
      const sub = this.manageRestrictionsRef.onClose.pipe(first()).subscribe(t => {
        if (type === BlackListRestrictionType.Channels) {
          this.isChannelRestrictionOpen = false;
        }
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

    this._blacklistStorage.addBlackListItem(item, type);
  }

  onRemoveItem(index: number, type: BlackListRestrictionType) {
    this._blacklistStorage.removeBlackListItem(index, type);

    chrome.runtime.sendMessage({blackListRemoveItem: true});
  }

  onChangeTurningOn(value: boolean, type: BlackListRestrictionType) {
    this._blacklistStorage.setBlackListTutnedOn(value, type);
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
      let sub = from(this._blacklistStorage.init()).subscribe(_ => {
        this.isLoadedData = true;
        this._cdr.detectChanges();
      });
      this._subscription.add(sub);

      const handler = this._blacklistStorage.addHandler();

      sub = handler.subscribe(t => {
        if (this.manageRestrictionsRef && this.isChannelRestrictionOpen) {
          this.manageRestrictionsRef.componentRef.instance.restrictionList = this.blackListData[BlackListRestrictionType.Channels];
        }

      });
      this._subscription.add(sub);
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
    this._blacklistStorage.removeHandler();
  }
}
