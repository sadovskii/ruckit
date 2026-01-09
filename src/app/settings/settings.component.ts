import { Component, OnInit } from '@angular/core';
import { SideBarItemsType } from './sidebar/sidebar-items';
import { OpenFullPageAction } from '../shared/types';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public activeSidebarItem: SideBarItemsType = SideBarItemsType.Header; 
  public SideBarItemsType = SideBarItemsType;

  constructor() {}

  ngOnInit(): void {
    const actionParam = this.getOpenFullPageAction();

    if (actionParam) {
      this.removeActionParamFromUrl();
    }

    const openFullPageAction = this.convertActionParamtoOpenFullPageAction(actionParam);
    this.activeSidebarItem = this.convertActionToSidebarItem(openFullPageAction);
  }

  onSidebarItemChanged(type: SideBarItemsType) {
    this.activeSidebarItem = type;
  }

  getOpenFullPageAction(): null | string {
    const params = new URLSearchParams(window.location.search);
    return params.get('action');
  }

  convertActionParamtoOpenFullPageAction(action: string | null): OpenFullPageAction {
    const actionEnum = Object.values(OpenFullPageAction).includes(action as OpenFullPageAction)
      ? action as OpenFullPageAction
      : OpenFullPageAction.Home;

    return actionEnum;
  }

  removeActionParamFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    window.history.replaceState({}, document.title, url.toString());
  }

  convertActionToSidebarItem(action: OpenFullPageAction) {
    switch (action) {
      case OpenFullPageAction.BlackList:
        return SideBarItemsType.BlackList;
      case OpenFullPageAction.Hidelist:
        return SideBarItemsType.HideList;
      case OpenFullPageAction.Settings:
        return SideBarItemsType.Settings;
      case OpenFullPageAction.Home:
      default:
        return SideBarItemsType.Header;
    }
  }

  async onCheckSettings() {
  }
}
