import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HideListItemModel, HideListItemType } from '../hide-list.models';

@Component({
  selector: 'app-hide-list-block',
  templateUrl: './hide-list-block.component.html',
  styleUrls: ['./hide-list-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HideListBlockComponent {

  @Input({ required: true })
  public items: HideListItemModel[];

  @Input({ required: true })
  public header: string;

  @Input({ required: true })
  public isRestricted: boolean

  @Output()
  public update = new EventEmitter<HideListItemModel>();

  @Output()
  public restrictedClickAttempt = new EventEmitter<void>;

  updateItem(item: HideListItemModel) {
    this.update.emit(item);
  }
}
