import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HideListItemModel, HideListItemType } from '../hide-list.models';

@Component({
  selector: 'app-hide-list-block',
  templateUrl: './hide-list-block.component.html',
  styleUrls: ['./hide-list-block.component.scss']
})
export class HideListBlockComponent {

  @Input({ required: true })
  public items: HideListItemModel[];

  @Input({ required: true })
  public header: string;

  @Output()
  public update = new EventEmitter<HideListItemModel>();

  updateItem(item: HideListItemModel) {
    this.update.emit(item);
  }
}
