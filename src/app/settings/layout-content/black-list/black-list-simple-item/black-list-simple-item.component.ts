import { ChangeDetectorRef, Component, Input } from '@angular/core';

@Component({
  selector: 'app-black-list-simple-item',
  templateUrl: './black-list-simple-item.component.html',
  styleUrl: './black-list-simple-item.component.scss'
})
export class BlackListSimpleItemComponent {
  @Input({ required: true })
  public header: string;

  @Input({ required: true })
  public description: string;

  @Input({ required: true })
  public isRestricted: boolean;

  @Input({ required: true })
  public placeholder: string;

  @Input({ required: true })
  public hidenItems: string;

  @Input({ required: true })
  public hidenCountItems: number;

  public checked: boolean;

  constructor(private _cdr: ChangeDetectorRef) {}

  onToggleClick() {
    this.checked = !this.checked;
  }
}
