import { Component, Input } from '@angular/core';
import { ViewVersions } from 'src/app/shared/types';

@Component({
  selector: 'app-settings-item',
  templateUrl: './settings-item.component.html',
  styleUrls: ['./settings-item.component.scss']
})
export class SettingsItemComponent {
  @Input({ required: true })
  public header: string;

  @Input({ required: true })
  public description: string;

  @Input()
  public viewVersion: ViewVersions = ViewVersions.large;

  @Input()
  public disabled = false;

  protected ViewVersions = ViewVersions;
}
