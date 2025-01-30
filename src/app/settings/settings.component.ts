import { Component } from '@angular/core';
import { SideBarItemsType } from './sidebar/sidebar-items';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public activeSidebarItem: SideBarItemsType = SideBarItemsType.Header; 
  public SideBarItemsType = SideBarItemsType;


  onSidebarItemChanged(type: SideBarItemsType) {
    this.activeSidebarItem = type;
  }

  async onCheckSettings() {
  }
}
