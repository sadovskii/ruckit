import { Component } from '@angular/core';
import { EXTENSION_IDENTIFIER } from '../shared/constants';
import { ChromeService } from '../shared/services/chrome/chrome.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  constructor(private _chromeService: ChromeService) {}

  async onRouteToMainPage() {
    this._chromeService.openIndexToNewTab();
  }

  async onCheckPopup() {
  }
}
