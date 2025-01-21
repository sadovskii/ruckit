import { Component, EventEmitter, Output } from '@angular/core';
import { POPUP_NAVBAR_ITEMS } from './popup-navbar';
import { PopupNavbarItemType } from './popup-navbar-item/popup-navbar-item-type';

@Component({
  selector: 'app-popup-navbar',
  templateUrl: './popup-navbar.component.html',
  styleUrl: './popup-navbar.component.scss'
})
export class PopupNavbarComponent {
  protected popupNavbarItems = POPUP_NAVBAR_ITEMS;

  @Output()
  public navbarChanged = new EventEmitter<PopupNavbarItemType>();

  clickItem(type: PopupNavbarItemType) {
    this.popupNavbarItems.blackList.active = false;
    this.popupNavbarItems.hideList.active = false;
    this.popupNavbarItems.settings.active = false;
    this.navbarChanged.emit(type);

    switch(type) {
      case PopupNavbarItemType.BlackList: {
        this.popupNavbarItems.blackList.active = true;
        break;
      }
      case PopupNavbarItemType.HideList: {
        this.popupNavbarItems.hideList.active = true;
        break;
      }
      case PopupNavbarItemType.Settings: {
        this.popupNavbarItems.settings.active = true;
        break;
      }
    }
  }
}
