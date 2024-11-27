import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { TagType } from '../tag/tag.types';

@Component({
  selector: 'ruckit-dialog',
  templateUrl: './ruckit-dialog.component.html',
  styleUrls: ['./ruckit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuckitDialogComponent {

  @Output()
  public readonly closed = new EventEmitter();

  @Input({ required: true })
  public header: string;

  @Input({ required: true })
  public tagType: TagType;

  @Input({ required: true })
  public tagValue: string;

  @Input()
  public width = '550px';

  public isCloserClicked: boolean = false

  constructor(private _cdr: ChangeDetectorRef) {}

  close() {
    this.isCloserClicked = true;
    setTimeout(() => this.closed.emit(), 150);
  }
}
