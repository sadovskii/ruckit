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
  
  toggleControl: FormControl<boolean | null>;

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.toggleControl = new FormControl(this.item.value ?? false);
    this._initToggleHandler();
  }

  private _initToggleHandler() {
    this.toggleControl.valueChanges.subscribe(value => {
      this.item.value = value!;
      this._cdr.detectChanges();
      this.update.emit(this.item);
    })
  }
}
