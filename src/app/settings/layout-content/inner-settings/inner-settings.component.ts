import { Component } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { NebularThemes } from 'src/app/shared/types';

@Component({
  selector: 'app-inner-settings',
  templateUrl: './inner-settings.component.html',
  styleUrls: ['./inner-settings.component.scss']
})
export class InnerSettingsComponent {
  selectedItem = NebularThemes.default;
  public NebularThemes = NebularThemes;


  constructor(private _themeService: NbThemeService) {}

  onChangeTheme() {
    console.log(this.selectedItem);
    this._themeService.changeTheme(this.selectedItem);
  }
}
