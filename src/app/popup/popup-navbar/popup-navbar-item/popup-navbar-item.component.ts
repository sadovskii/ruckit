import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-popup-navbar-item',
  templateUrl: './popup-navbar-item.component.html',
  styleUrl: './popup-navbar-item.component.scss'
})
export class PopupNavbarItemComponent {
  @Input({ required: true })
  public linearIcon: string;

  @Input({ required: true })
  public solidIcon: string;

  @Input()
  public active: boolean;
}
