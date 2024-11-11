import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  async onCheckSettings() {
    console.log("window ", await chrome.windows.getCurrent());
    console.log("chrome.tabs current ", await chrome.tabs.getCurrent());
  }
}
