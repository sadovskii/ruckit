import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { TagType } from 'src/app/shared/components/tag/tag.types';
import { BlackListRestrictionType, BlackListRestritionModel, MAX_LENGTH_RESTRICTION } from '../black-list.models';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-black-list-manage-restrictions',
  templateUrl: './black-list-manage-restrictions.component.html',
  styleUrl: './black-list-manage-restrictions.component.scss'
})
export class BlackListManageRestrictionsComponent {
  public TagType = TagType;

  protected invalidAfterClick = false;
  
  @Input({ required: true })
  public type: BlackListRestrictionType;

  @Input()
  public restrictionList: string[] = [];
  
  @Output()
  public addItem = new EventEmitter<string>;

  @Output()
  public removeItem = new EventEmitter<number>;

  protected addItemFormControl = new FormControl<string>('', [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)]);

  constructor(private _dialogRef: NbDialogRef<BlackListManageRestrictionsComponent>) {}

  protected onClose() {
    this._dialogRef.close();
  }

  protected addItemClick() {
    this.invalidAfterClick = true;
    if (this.addItemFormControl.valid) {
      this.invalidAfterClick = false;
      this.addItem.emit(this.addItemFormControl.value!);
      this.addItemFormControl.reset();
    }
  }

  protected notFoundAddItem(value: string) {
    this.addItem.emit(value);
  }

  protected onRemoveItem(index: number) {
    this.removeItem.emit(index)
  }

  get placeholder() {
    if (this.type === BlackListRestrictionType.Channels) {
      return `${BlackListRestrictionType.Channels} name`;
    }
    else {
      return this.type.toString();
    }
  }
}
