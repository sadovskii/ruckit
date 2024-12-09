import { Component, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { STORAGE_THEME_ID } from 'src/app/shared/constants';
import { ChromeService } from 'src/app/shared/services/chrome/chrome.service';
import { NebularThemes } from 'src/app/shared/types';

@Component({
  selector: 'app-inner-settings',
  templateUrl: './inner-settings.component.html',
  styleUrls: ['./inner-settings.component.scss']
})
export class InnerSettingsComponent implements OnInit {
  selectedTheme: NebularThemes = NebularThemes.default;
  public NebularThemes = NebularThemes;

  constructor(
    private _themeService: NbThemeService,
    private _chromeService: ChromeService
  ) {}

  ngOnInit(): void {
    this.initThemeSelected();
  }

  onChangeTheme() {
    this._chromeService.storageSyncSet<string>(STORAGE_THEME_ID, this.selectedTheme)
    this._themeService.changeTheme(this.selectedTheme);
  }

  initThemeSelected() {
    this._chromeService.storageSyncGetItem(STORAGE_THEME_ID).subscribe(theme => {
      if (theme) {
        this.selectedTheme = theme;
      }
      else {
        this.selectedTheme = NebularThemes.default;
      }
    })
  }
}
