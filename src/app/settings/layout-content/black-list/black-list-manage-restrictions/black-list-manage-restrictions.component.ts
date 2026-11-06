import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { TagType } from 'src/app/shared/components/tag/tag.types';
import { BlackListRestrictionType, blackListRestrictionTypeToMessageKeys } from '../black-list.models';
import { FormControl } from '@angular/forms';
import { BLACK_LIST_ITEM_VALIDATORS } from '../black-list-item.validator';
import { normalizeBlackListItem } from 'src/extension/black-list/common/black-list-item-rules';

@Component({
  selector: 'app-black-list-manage-restrictions',
  templateUrl: './black-list-manage-restrictions.component.html',
  styleUrl: './black-list-manage-restrictions.component.scss'
})
export class BlackListManageRestrictionsComponent {
  public TagType = TagType;
  public BlackListRestrictionType = BlackListRestrictionType;

  protected invalidAfterClick = false;
  
  @Input({ required: true })
  public type: BlackListRestrictionType;

  @Input()
  public restrictionList: string[] = [];
  
  @Output()
  public addItem = new EventEmitter<string>;

  @Output()
  public removeItem = new EventEmitter<number>;

  protected addItemFormControl = new FormControl<string>('', BLACK_LIST_ITEM_VALIDATORS);

  constructor(private _dialogRef: NbDialogRef<BlackListManageRestrictionsComponent>) {}

  protected onClose() {
    this._dialogRef.close();
  }

  protected addItemClick() {
    this.invalidAfterClick = true;
    if (this.addItemFormControl.valid) {
      this.invalidAfterClick = false;
      this.addItem.emit(normalizeBlackListItem(this.addItemFormControl.value!));
      this.addItemFormControl.reset();
    }
  }

  protected notFoundAddItem(value: string) {
    this.addItem.emit(normalizeBlackListItem(value));
  }

  protected onRemoveItem(index: number) {
    this.removeItem.emit(index)
  }

  get messages() {
    return blackListRestrictionTypeToMessageKeys[this.type];
  }
}
