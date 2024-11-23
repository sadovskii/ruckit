import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HideListItemModel } from '../../hide-list.models';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-hide-list-block-item',
  templateUrl: './hide-list-block-item.component.html',
  styleUrls: ['./hide-list-block-item.component.scss']
})
export class HideListBlockItemComponent implements OnInit {
  @Input({ required: true })
  public item: HideListItemModel;

  @Output()
  public update = new EventEmitter<HideListItemModel>;

  toggleFormControl: FormControl;

  ngOnInit(): void {
    this.initToogleControl()
  }

  initToogleControl() {
    this.toggleFormControl = new FormControl(this.item.value ?? false);
    this.toggleFormControl.valueChanges.subscribe(t => {

      if (t !== null) {
        this.item.value = t;
        this.update.emit(this.item);
      }
    })
  }
}
