import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BlackListRestrictionType, MAX_LENGTH_RESTRICTION } from '../black-list.models';

@Component({
  selector: 'app-black-list-simple-item',
  templateUrl: './black-list-simple-item.component.html',
  styleUrl: './black-list-simple-item.component.scss'
})
export class BlackListSimpleItemComponent implements OnInit {
  @Input({ required: true })
  public isRestricted: boolean;

  @Input({ required: true })
  public hidenCountItems: number;

  @Input()
  public checked: boolean = true;

  @Input({ required: true })
  public type: BlackListRestrictionType

  @Output()
  public manageResctrictionClick = new EventEmitter<void>();

  @Output()
  public addItem = new EventEmitter<string>;

  public disabled: boolean = !this.checked;

  protected invalidAfterClick = false;
  protected toggleControl = new FormControl(this.checked);
  protected addItemControl = new FormControl<string>('', [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)])

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.toggleControl.valueChanges.subscribe(value => {
      this.disabled = !value!;
      this.checked = value!;
    })
  }

  onManageRestrictionsClick() {
    this.manageResctrictionClick.emit();
  }

  onAddItemClick() {
    if (this.addItemControl.invalid) {
      this.invalidAfterClick = true;
      return;
    }

    this.addItemControl.setValue('');
    this.addItemControl.reset();
    this.invalidAfterClick = false;
    
    this.addItem.emit(this.addItemControl.value!);
  }
}
