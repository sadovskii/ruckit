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

  public setTypeStyle(): string {
    if (this.type === TagType.Red) {
      return "tag_red";
    }
    else {
      return "tag_green";
    }
  }
}
