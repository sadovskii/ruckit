import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BlackListRestrictionType, MAX_LENGTH_RESTRICTION } from '../black-list.models';
import { ViewVersions } from 'src/app/shared/types';
import { NbComponentSize } from '@nebular/theme';

@Component({
  selector: 'app-black-list-simple-item',
  templateUrl: './black-list-simple-item.component.html',
  styleUrl: './black-list-simple-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlackListSimpleItemComponent implements OnInit {

  public BlackListRestrictionType = BlackListRestrictionType;

  @Input({ required: true })
  public isRestricted: boolean;

  @Input({ required: true })
  public hidenCountItems: number;

  @Input({ required: true })
  public checked: boolean;

  @Input({ required: true })
  public type: BlackListRestrictionType;

  @Input({ required: true })
  public viewVersion: ViewVersions;

  @Output()
  public manageResctrictionClick = new EventEmitter<void>();

  @Output()
  public addItem = new EventEmitter<string>;

  @Output()
  public changeToggle = new EventEmitter<boolean>;

  public disabled: boolean;

  protected ViewVersions = ViewVersions;
  protected invalidAfterClick = false;
  protected toggleControl: FormControl;
  protected addItemControl: FormControl<string | null>;

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('this.checked = ', this.checked);
    this.disabled = !this.checked;
    this.toggleControl = new FormControl(this.checked);
    this.addItemControl = new FormControl<string>(
      { value: '', disabled: this.disabled},
      [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)]
    )

    this.toggleControl.valueChanges.subscribe(value => {
      this.disabled = !value!;
      this.checked = value!;
      this.changeToggle.emit(this.checked);
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
    
    this.addItem.emit(this.addItemControl.value!);

    this.addItemControl.setValue('');
    this.addItemControl.reset();
    this.invalidAfterClick = false;
  }

  get sizeByViewVersion() : NbComponentSize {
    let size: NbComponentSize = 'medium';

    if (this.viewVersion === this.ViewVersions.small) {
      size = 'small';
    }

    return size;
  }

  get placeholder() {
    if (this.type === BlackListRestrictionType.Channels) {
      return `${BlackListRestrictionType.Channels} name (e.g. @example)`;
    }
    else {
      return this.type.toString();
    }
  }
}
