import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ChromeService } from '../shared/services/chrome/chrome.service';
import { PopupNavbarItemType } from './popup-navbar/popup-navbar-item/popup-navbar-item-type';
import { ViewVersions } from '../shared/types';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupComponent {

  protected activeItem: PopupNavbarItemType = PopupNavbarItemType.BlackList;
  protected PopupNavbarItemType = PopupNavbarItemType;
  protected ViewVersions = ViewVersions;
  
  constructor(private _chromeService: ChromeService, private _cdr: ChangeDetectorRef) {}

  onNavbarChanged(type: PopupNavbarItemType) {
    console.log('onNavbarChanged = ', type);
    console.log('activeItem before = ', this.activeItem);
    this.activeItem = type;
    this._cdr.detectChanges();

    console.log('activeItem after = ', this.activeItem);
  }

  async onRouteToMainPage() {
    this._chromeService.openIndexToNewTab();
  }

  async onCheckPopup() {
  }
}
