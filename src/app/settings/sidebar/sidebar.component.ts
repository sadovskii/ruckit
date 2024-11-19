import { Component, EventEmitter, Output } from '@angular/core';
import { SideBarItems, SideBarItemsType } from './sidebar-items';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public SideBarItemsType = SideBarItemsType;
  public SideBarItems = SideBarItems;

  @Output()
  public sidebarItemChanged = new EventEmitter<SideBarItemsType>;

  clickItem(type: SideBarItemsType) {
    SideBarItems.aboutExtension.params.active = false;
    SideBarItems.blackList.params.active = false;
    SideBarItems.hideList.params.active = false;
    SideBarItems.password.params.active = false;
    SideBarItems.settings.params.active = false;

    let isExistType = true;

    switch (type) {
      case SideBarItemsType.AboutExtension: {
        SideBarItems.aboutExtension.params.active = true;
        break;
      }
      case SideBarItemsType.BlackList: {
        SideBarItems.blackList.params.active = true;
        break;
      }
      case SideBarItemsType.HideList: {
        SideBarItems.hideList.params.active = true;
        break;
      }
      case SideBarItemsType.Password: {
        SideBarItems.password.params.active = true;
        break;
      }
      case SideBarItemsType.Settings: {
        SideBarItems.settings.params.active = true;
        break;
      }
      case SideBarItemsType.Header: {
        break;
      }
      default: {
        console.log("unexpected type = ", type);
        isExistType = false;
        break;
      }
    }

    this.sidebarItemChanged.emit(type);
  }
}
