import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TagType } from '../tag/tag.types';

@Component({
  selector: 'ruckit-dialog',
  templateUrl: './ruckit-dialog.component.html',
  styleUrls: ['./ruckit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuckitDialogComponent {
  @Input({ required: true })
  public header: string;

  @Input({ required: true })
  public tagType: TagType;

  @Input({ required: true })
  public tagValue: string;
}
