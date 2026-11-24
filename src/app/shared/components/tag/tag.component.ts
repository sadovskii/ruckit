import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TagType } from './tag.types';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent {

  @Input()
  public value: string;

  @Input()
  public type: TagType;

  // optional icon before the text; takes the colour of the tag
  @Input()
  public icon?: string;

  @Input()
  public iconPack = 'ruckit-16';

  public setTypeStyle(): string {
    if (this.type === TagType.Red) {
      return "tag_red";
    }
    else {
      return "tag_green";
    }
  }
}
