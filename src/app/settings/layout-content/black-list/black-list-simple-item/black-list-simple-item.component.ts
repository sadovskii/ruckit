import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BlackListRestrictionType, MAX_LENGTH_RESTRICTION } from '../black-list.models';
import { ViewVersions } from 'src/app/shared/types';
import { NbComponentSize } from '@nebular/theme';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-black-list-simple-item',
  templateUrl: './black-list-simple-item.component.html',
  styleUrl: './black-list-simple-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlackListSimpleItemComponent implements OnInit, OnChanges, OnDestroy  {

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
  protected subscription = new Subscription();

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['checked']) {

      if (this.toggleControl && changes['checked'].currentValue !== this.toggleControl.value) {
        this.toggleControl.setValue(changes['checked'].currentValue);
      }
    }
  }

  ngOnInit(): void {
    this.disabled = !this.checked;
    this.toggleControl = new FormControl(this.checked);
    this.addItemControl = new FormControl<string>(
      { value: '', disabled: this.disabled},
      [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)]
    )

    const sub = this.toggleControl.valueChanges.subscribe(value => {
      this.disabled = !value!;
      this.checked = value!;
      this.changeToggle.emit(this.checked);
    });

    this.subscription.add(sub);
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
