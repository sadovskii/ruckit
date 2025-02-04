import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MAX_LENGTH_RESTRICTION } from 'src/app/settings/layout-content/black-list/black-list.models';

@Component({
  selector: 'ruckit-option-list',
  templateUrl: './ruckit-option-list.component.html',
  styleUrl: './ruckit-option-list.component.scss'
})
export class RuckitOptionListComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  public optionList: string[];

  @Input({ required: true })
  public placeholder: string;

  @Input()
  public disabled: boolean;

  @Input()
  public maxLengthRestriction = 200;

  @Input()
  public height: string = '13.1rem';

  @Output()
  public addItem = new EventEmitter<string>;

  @Output()
  public removeItem = new EventEmitter<number>;

  protected searchFormControl = new FormControl<string>('', [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)]);
  protected filteredOptionList: string[];
  protected invalidAfterClick = false;

  private _subscriptions = new Subscription();

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.filteredOptionList = this.optionList;
    this._initSearchChangesHandler();
  }

  trackOptionList(index: any, item: string) {
    return item;
  }

  remove(index: number) {
    this.removeItem.emit(index);
  }

  protected addItemClick() {
    this.invalidAfterClick = true;
    if (this.searchFormControl.valid) {
      this.invalidAfterClick = false;
      this.addItem.emit(this.searchFormControl.value!);
      this.searchFormControl.setValue('');
      this.searchFormControl.reset();
    }
  }

  private _initSearchChangesHandler() {
    const sub = this.searchFormControl.valueChanges.subscribe(search => {
      if (search === null) {
        return;
      }

      if (search.length == 0) {
        this.filteredOptionList = this.optionList;
        return;
      }
      
      let searchLowerCase = search?.toLowerCase();

      this.filteredOptionList = this.optionList.filter(t => t?.toLowerCase().includes(searchLowerCase))
    })

    this._subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
