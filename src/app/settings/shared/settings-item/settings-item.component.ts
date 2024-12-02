import { Component, Input } from '@angular/core';

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
  public disabled = false;
}
