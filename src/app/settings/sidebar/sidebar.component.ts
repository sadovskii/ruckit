import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SideBarItems, SideBarItemsType } from './sidebar-items';
import { CHROME_WEBSTORE_REVIEWS_URL } from 'src/app/shared/constants';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public SideBarItemsType = SideBarItemsType;
  public SideBarItems = SideBarItems;
  public extensionReviewsUrl = CHROME_WEBSTORE_REVIEWS_URL;

  @Input({required: true})
  public activeSidebarItem: SideBarItemsType;

  @Output()
  public sidebarItemChanged = new EventEmitter<SideBarItemsType>;

  ngOnInit(): void {
    this.changeItem(this.activeSidebarItem);
  }

  changeItem(type: SideBarItemsType) {
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

  openExtensionReviews() {
    window.open(this.extensionReviewsUrl, '_blank');
  }
}
