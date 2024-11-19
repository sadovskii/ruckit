import { ChangeDetectorRef, Component } from '@angular/core';
import { SideBarItems, SideBarItemsType } from './sidebar-items';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public SideBarItemsType = SideBarItemsType;
  public SideBarItems = SideBarItems;

  constructor(private _cdr: ChangeDetectorRef) {}

  clickItem(type: SideBarItemsType) {
    console.log("type = ", type);
    switch (type) {
      case SideBarItemsType.AboutExtension: {
        SideBarItems.aboutExtension.params.active = true;
        SideBarItems.blackList.params.active = false;
        SideBarItems.hideList.params.active = false;
        SideBarItems.password.params.active = false;
        SideBarItems.settings.params.active = false;
        this._cdr.markForCheck();
        break;
      }
      case SideBarItemsType.BlackList: {
        SideBarItems.aboutExtension.params.active = false;
        SideBarItems.blackList.params.active = true;
        SideBarItems.hideList.params.active = false;
        SideBarItems.password.params.active = false;
        SideBarItems.settings.params.active = false;
        break;
      }
      case SideBarItemsType.HideList: {
        SideBarItems.aboutExtension.params.active = false;
        SideBarItems.blackList.params.active = false;
        SideBarItems.hideList.params.active = true;
        SideBarItems.password.params.active = false;
        SideBarItems.settings.params.active = false;
        break;
      }
      case SideBarItemsType.Password: {
        SideBarItems.aboutExtension.params.active = false;
        SideBarItems.blackList.params.active = false;
        SideBarItems.hideList.params.active = false;
        SideBarItems.password.params.active = true;
        SideBarItems.settings.params.active = false;
        break;
      }
      case SideBarItemsType.Settings: {
        SideBarItems.aboutExtension.params.active = false;
        SideBarItems.blackList.params.active = false;
        SideBarItems.hideList.params.active = false;
        SideBarItems.password.params.active = false;
        SideBarItems.settings.params.active = true;
        break;
      }
      case SideBarItemsType.Header: {
        SideBarItems.aboutExtension.params.active = false;
        SideBarItems.blackList.params.active = false;
        SideBarItems.hideList.params.active = false;
        SideBarItems.password.params.active = false;
        SideBarItems.settings.params.active = false;
        break;
      }
      default: {
        console.log("unexpected type = ", type);
        break;
      }
    }
  }
}
