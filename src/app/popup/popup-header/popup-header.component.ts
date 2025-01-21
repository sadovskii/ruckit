import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-popup-header',
  templateUrl: './popup-header.component.html',
  styleUrl: './popup-header.component.scss'
})
export class PopupHeaderComponent {

  @Output()
  public extendedSettingsClick = new EventEmitter();

  onClick() {
    this.extendedSettingsClick.emit();
  }
}
