import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HideListItemModel } from '../../hide-list.models';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-hide-list-block-item',
  templateUrl: './hide-list-block-item.component.html',
  styleUrls: ['./hide-list-block-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HideListBlockItemComponent implements OnInit {
  @Input({ required: true })
  public item: HideListItemModel;

  @Input({ required: true })
  public isRestricted: boolean;

  @Output()
  public update = new EventEmitter<HideListItemModel>;

  @Output()
  public restrictedClickAttempt = new EventEmitter<void>;
  checked: boolean;

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.checked = this.item.value ?? false;
  }

  onRequestToggleClick() {
    if (this.isRestricted && this.checked) {
      this.restrictedClickAttempt.emit();
      return;
    }

    this.checked = !this.checked;
    this.item.value = this.checked;
    this._cdr.detectChanges();
    this.update.emit(this.item);
  }
}
